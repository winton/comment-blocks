export interface CommentBlockIteratorOptions {
  show?: boolean
  memo?: Record<string, any>
  params?: Record<string, string>
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
  ) => string
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
  params: Record<string, string>
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

  const og = options?.originals || { src, indices }

  if (indices.length === 0 && $.show) {
    return cb.process(src, $)
  }

  const sortedIndices = indices.sort(
    (a, b) => a.startCommentIndex - b.startCommentIndex
  )

  const strings = []

  let processedIndices: CommentBlockIndices[] = []

  let index = -1

  for (const module of sortedIndices) {
    index++

    if (index === 0 && $.show) {
      strings.push(
        cb.process(
          src.slice(0, module.startCommentIndex),
          $
        )
      )
    }

    if (!processedIndices.includes(module)) {
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
                iterator: {
                  ...match,
                  memo: { ...$.memo, ...match?.memo },
                },
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

        const childMatches = indices.filter(
          ({ startCommentIndex, endIndex }) =>
            module.startBodyIndex < startCommentIndex &&
            module.endIndex > endIndex
        )

        processedIndices =
          processedIndices.concat(childMatches)

        const children = offsetIndices(
          childMatches,
          module.startBodyIndex
        )

        for (const match of matches || [undefined]) {
          const out = commentIterator(body, children, {
            callbacks: cb,
            iterator: {
              ...match,
              memo: { ...$.memo, ...match?.memo },
            },
            originals: og,
          })

          if (out) {
            strings.push(" ".repeat(module.indent) + out)
          }
        }
      }

      const nextModule = sortedIndices[index + 1]

      if ($.show) {
        if (nextModule) {
          strings.push(
            cb.process(
              src.slice(
                module.endIndex,
                nextModule.startCommentIndex
              ),
              $
            )
          )
        } else {
          strings.push(
            cb.process(src.slice(module.endIndex, -1), $)
          )
        }
      }
    }
  }

  const out = strings
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
  const {
    commentStart,
    commentEnd,
    modTrigger,
    refTrigger,
  } = {
    ...defaultIndicesOptions,
    ...options,
  } as Required<CommentBlockIndicesOptions>

  const commentRegex = new RegExp(
    `^(\\s*)${commentStart}\\s*(${modTrigger}|${refTrigger})(.*?)${commentEnd}\\s*\\n(\\s*)`,
    "gms"
  )

  const results = []

  let result

  while ((result = commentRegex.exec(str)) !== null) {
    const searchStr =
      result[4] + str.slice(commentRegex.lastIndex)

    const endIndex = searchStr.search(
      new RegExp(
        `^(\\s{0,${
          result[2] === refTrigger
            ? ""
            : result[4].length - 1
        }}[^\\s]|\\s{0,${
          result[4].length
        }}<!--\\s*(${modTrigger}|${refTrigger}))`,
        "gms"
      )
    )

    const commentBody = result[3].trim()
    const match = commentBody.match(/^([^,\n]+)(.*)/)

    if (match) {
      const params = match[2]
        .trim()
        .split(/\s*[,\n]\s*/)
        .map((piece) => piece.split(/\s*:\s*/))
        .reduce((memo, [key, value]) => {
          if (key !== "") {
            memo[key] = value || ""
          }
          return memo
        }, {} as Record<string, string>)

      results.push({
        moduleName: match[1].trim(),
        params,
        indent:
          result[2] === refTrigger
            ? result[1].length
            : result[4].length,
        startCommentIndex:
          commentRegex.lastIndex -
          result[0].length +
          result[1].length,
        startBodyIndex: commentRegex.lastIndex,
        endIndex:
          commentRegex.lastIndex +
          (endIndex === -1 ? searchStr.length : endIndex) -
          result[4].length,
        trigger: (result[2] === refTrigger
          ? "ref"
          : "mod") as "ref" | "mod",
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
    params?: Record<string, string>
    values?: Record<string, string>
  }
): string {
  let newStr = str

  if (params) {
    for (const name in params) {
      const value = params[name]

      if (values && values[name] && value === "this") {
        newStr = values[name]
      }
    }

    for (const name in params) {
      const value = params[name]

      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(escapeRegex(value), "g")
        newStr = newStr.replace(regex, replaceKey)
      }
    }

    for (const name in params) {
      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(
          escapeRegex(replaceKey),
          "g"
        )

        if (values[name] !== undefined) {
          newStr = newStr.replace(
            regex,
            values[name].toString()
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
