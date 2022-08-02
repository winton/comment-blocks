export interface CommentBlockIteratorParams {
  optional: boolean
  value: string
}

export interface CommentBlockIteratorOptions {
  show?: boolean
  memo?: Record<string, any>
  params?: Record<string, CommentBlockIteratorParams>
  values?: Record<string, string>
}

export interface CommentBlockOriginalsOptions {
  indices: CommentBlockIndices[]
  src: string
}

export interface CommentBlockCallbackOptions {
  match?: (
    module: CommentBlockIndices,
    options: CommentBlockIteratorOptions
  ) => CommentBlockIteratorOptions[] | undefined

  process?: (
    str: string,
    options: CommentBlockIteratorOptions
  ) => string | undefined
}

export interface CommentBlockIndicesOptions {
  commentStart?: string
  commentEnd?: string
  modTrigger?: string
  refTrigger?: string
}

export interface CommentBlockIndices {
  trigger: "mod" | "ref"
  moduleName: string
  params: Record<string, CommentBlockIteratorParams>
  indent: number
  startCommentIndex: number
  startBodyIndex: number
  endIndex: number
}

export const defaultCallbackOptions: Required<CommentBlockCallbackOptions> =
  {
    process: (str) => str,
    match: () => [{ show: true }],
  }

export const defaultIteratorOptions: Required<CommentBlockIteratorOptions> =
  {
    show: false,
    memo: {},
    params: {},
    values: {},
  }

export const defaultIndicesOptions: Required<CommentBlockIndicesOptions> =
  {
    commentStart: "<!--",
    commentEnd: "-->",
    modTrigger: "mod:",
    refTrigger: "ref:",
  }

export function commentIterator(
  src: string,
  indices: CommentBlockIndices[],
  options: {
    iterator?: CommentBlockIteratorOptions
    callbacks?: CommentBlockCallbackOptions
    originals?: CommentBlockOriginalsOptions
  } = {}
): string | undefined {
  const $ = {
    ...defaultIteratorOptions,
    ...options.iterator,
  } as Required<CommentBlockIteratorOptions>

  const cb = {
    ...defaultCallbackOptions,
    ...options.callbacks,
  } as Required<CommentBlockCallbackOptions>

  const og = {
    ...{ src, indices },
    ...options.originals,
  } as Required<CommentBlockOriginalsOptions>

  if (indices.length === 0 && $.show) {
    return cb.process(src, $)
  }

  const sortedIndices = indices.sort(
    (a, b) => a.startCommentIndex - b.startCommentIndex
  )

  const strings = []

  let processedIndices: CommentBlockIndices[] = []

  let lastProcessed: CommentBlockIndices | undefined =
    undefined

  let index = -1

  for (const module of sortedIndices) {
    index++

    const nextModule = sortedIndices[index + 1]

    if (index === 0 && $.show) {
      strings.push(
        cb.process(
          src.slice(0, module.startCommentIndex),
          $
        )
      )
    }

    if (!processedIndices.includes(module)) {
      lastProcessed = module

      const matches = cb.match(module, $)

      if (module.trigger === "ref" && matches?.length) {
        const refModule = og.indices.find(
          ({ moduleName }) =>
            module.moduleName === moduleName
        )

        if (refModule) {
          for (const match of matches) {
            const out = commentIterator(
              og.src.slice(
                refModule.startBodyIndex,
                refModule.endIndex
              ),
              offsetIndices(
                og.indices.filter(
                  ({ startCommentIndex, endIndex }) =>
                    startCommentIndex >=
                      refModule.startCommentIndex &&
                    endIndex <= refModule.endIndex
                ),
                refModule.startBodyIndex
              ),
              {
                callbacks: cb,
                iterator: match,
                originals: og,
              }
            )

            if (out) {
              strings.push(
                " ".repeat(refModule.indent) + out
              )
            }
          }
        }
      }

      if (module.trigger === "mod") {
        const body = src.slice(
          module.startBodyIndex,
          module.endIndex
        )

        const childIndices = indices.filter(
          ({ startCommentIndex, endIndex }) =>
            module.startBodyIndex < startCommentIndex &&
            module.endIndex > endIndex
        )

        processedIndices =
          processedIndices.concat(childIndices)

        const offsetChildIndices = offsetIndices(
          childIndices,
          module.startBodyIndex
        )

        for (const match of matches || [undefined]) {
          const out = commentIterator(
            body,
            offsetChildIndices,
            {
              callbacks: cb,
              iterator: match,
              originals: og,
            }
          )

          if (out) {
            strings.push(" ".repeat(module.indent) + out)
          }
        }
      }

      if (
        $.show &&
        nextModule &&
        !processedIndices.includes(nextModule)
      ) {
        strings.push(
          cb.process(
            src.slice(
              module.endIndex,
              nextModule.startCommentIndex
            ),
            $
          )
        )
      }
    }
  }

  if (lastProcessed && $.show) {
    strings.push(
      cb.process(src.slice(lastProcessed.endIndex, -1), $)
    )
  }

  const out = (
    strings.filter(
      (str) => typeof str === "string"
    ) as string[]
  )
    .map((str) => str.trimEnd())
    .filter((str) => str.length)
    .join("\n")
    .trim()

  return out.length ? out : undefined
}

export function commentIndices(
  str: string,
  options: CommentBlockIndicesOptions = {}
): CommentBlockIndices[] {
  const $ = {
    ...defaultIndicesOptions,
    ...options,
  } as Required<CommentBlockIndicesOptions>

  const commentStart = escapeRegex($.commentStart)
  const commentEnd = escapeRegex($.commentEnd)
  const modTrigger = escapeRegex($.modTrigger)
  const refTrigger = escapeRegex($.refTrigger)

  const commentRegex = new RegExp(
    `^(\\s*)${commentStart}\\s*(${modTrigger}|${refTrigger})(.*?)${commentEnd}\\s*\\n(\\s*)`,
    "gms"
  )

  const results = []

  let result

  while ((result = commentRegex.exec(str)) !== null) {
    const searchStr =
      result[4] + str.slice(commentRegex.lastIndex)

    const isRef = result[2] === $.refTrigger

    const endIndex = searchStr.search(
      new RegExp(
        `^(\\s{0,${
          isRef ? "" : result[4].length - 1
        }}[^\\s]|\\s{0,${
          result[4].length
        }}${commentStart}\\s*(${modTrigger}|${refTrigger}))`,
        "gms"
      )
    )

    const commentBody = result[3].trim()
    const match = commentBody.match(/([^\n]+)(.*)/s)

    if (match) {
      const params = match[2]
        .split(/\n/)
        .map((piece) =>
          piece.match(/\s*([^?:]+)(\??):\s*(.*)\s*/)
        )
        .reduce((memo, result) => {
          if (result) {
            const [, key, optional, value] = result

            memo[key] = {
              value,
              optional: optional === "?",
            }
          }
          return memo
        }, {} as Record<string, CommentBlockIteratorParams>)

      results.push({
        moduleName: match[1].trim(),
        params,
        indent: isRef ? result[1].length : result[4].length,
        startCommentIndex:
          commentRegex.lastIndex -
          result[0].length +
          result[1].length,
        startBodyIndex: commentRegex.lastIndex,
        endIndex:
          commentRegex.lastIndex +
          (endIndex === -1 ? searchStr.length : endIndex) -
          result[4].length,
        trigger: (isRef ? "ref" : "mod") as "ref" | "mod",
      })
    }
  }

  return results
}

export function offsetIndices(
  indices: CommentBlockIndices[],
  offset: number
) {
  return indices.map(
    (module): CommentBlockIndices => ({
      ...module,
      endIndex: module.endIndex - offset,
      startBodyIndex: module.startBodyIndex - offset,
      startCommentIndex: module.startCommentIndex - offset,
    })
  )
}

export function replaceParams(
  str: string,
  {
    params,
    values,
  }: {
    params?: Record<string, CommentBlockIteratorParams>
    values?: Record<string, string>
  }
): string | undefined {
  let newStr: string | undefined = str

  if (params) {
    for (const key in params) {
      const { optional, value } = params[key]

      if (values && values[key] && value === "this") {
        newStr = values[key]
        continue
      }

      if (values && !optional && !values[key]) {
        newStr = undefined
        continue
      }
    }

    if (newStr || newStr === undefined) {
      return newStr
    }

    for (const key in params) {
      const { value } = params[key]

      if (values && values[key] !== undefined) {
        const replaceKey = `$!-!-${key}-!-!$`
        const regex = new RegExp(escapeRegex(value), "g")
        newStr = newStr.replace(regex, replaceKey)
      }
    }

    for (const key in params) {
      if (values && values[key] !== undefined) {
        const replaceKey = `$!-!-${key}-!-!$`
        const regex = new RegExp(
          escapeRegex(replaceKey),
          "g"
        )

        if (values[key] !== undefined) {
          newStr = newStr.replace(
            regex,
            values[key].toString()
          )
        }
      }
    }
  }

  return newStr
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default (
  str: string,
  options: {
    callbacks?: CommentBlockCallbackOptions
    indices?: CommentBlockIndicesOptions
    iterator?: CommentBlockIteratorOptions
  } = {}
) => {
  return commentIterator(
    str,
    commentIndices(str, options.indices),
    options
  )
}
