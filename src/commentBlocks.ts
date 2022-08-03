export interface CommentBlockIteratorParams {
  optional: boolean
  value: string
}

export interface CommentBlockIteratorOptions {
  params: Record<string, CommentBlockIteratorParams>
  values: Record<string, string>
}

export interface CommentBlockOriginalsOptions {
  indices: CommentBlockIndices[]
  src: string
}

export interface CommentBlockCallbackOptions {
  hasMatch: (
    module: CommentBlockIndices,
    options: CommentBlockIteratorOptions,
    memo: Record<string, any>
  ) => boolean

  match: (
    module: CommentBlockIndices,
    options: CommentBlockIteratorOptions,
    memo: Record<string, any>
  ) =>
    | {
        options?: CommentBlockIteratorOptions[]
        memo?: Record<string, any>
      }
    | undefined

  process: (
    str: string,
    options: CommentBlockIteratorOptions,
    memo: Record<string, any>
  ) => string | undefined
}

export interface CommentBlockIndicesOptions {
  commentStart: string
  commentEnd: string
  modTrigger: string
  refTrigger: string
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
    hasMatch: () => true,
    match: (mod, options, memo) => ({
      options: [options],
      memo,
    }),
  }

export const defaultIteratorOptions: Required<CommentBlockIteratorOptions> =
  {
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

export function hasParent(
  module: CommentBlockIndices,
  indices: CommentBlockIndices[]
) {
  return indices.find(
    ({ startCommentIndex, endIndex }) =>
      module.endIndex < endIndex &&
      module.startCommentIndex > startCommentIndex
  )
}

export function commentIterator(
  src: string,
  indices: CommentBlockIndices[],
  options: {
    iterator?: CommentBlockIteratorOptions
    callbacks?: CommentBlockCallbackOptions
    originals?: CommentBlockOriginalsOptions
    memo?: Record<string, any>
    capture?: boolean
  } = {}
): string | undefined {
  const $ = options.iterator || defaultIteratorOptions
  const cb = options.callbacks || defaultCallbackOptions
  const og = options.originals || { src, indices }
  const memo = options.memo || {}
  const capture = options.capture || false

  if (indices.length === 0 && capture) {
    return cb.process(src, $, memo)
  }

  if (!capture) {
    const hasMatch = indices.some((module) =>
      cb.hasMatch(module, $, memo)
    )

    if (!hasMatch) {
      return
    }
  }

  const parentIndices = indices
    .filter((module) => !hasParent(module, indices))
    .sort(
      (a, b) => a.startCommentIndex - b.startCommentIndex
    )

  const strings: (string | undefined)[] = []

  let index = -1

  for (let module of parentIndices) {
    index++

    if (index === 0 && capture) {
      strings.push(
        cb.process(
          src.slice(0, module.startCommentIndex),
          $,
          memo
        )
      )
    }

    const match = cb.match(module, $, memo)

    const ogModule: CommentBlockIndices = module

    let refModule: CommentBlockIndices | undefined =
      undefined

    if (module.trigger === "ref") {
      refModule = og.indices.find(
        ({ moduleName, trigger }) =>
          module.moduleName === moduleName &&
          trigger === "mod"
      )

      if (refModule) {
        module = refModule
      } else {
        throw new Error(
          `Reference module "${module.moduleName}" not found.`
        )
      }
    }

    const indent = " ".repeat(module.indent)

    const childIndices = offsetIndices(
      (refModule ? og.indices : indices).filter(
        ({ startBodyIndex, endIndex }) =>
          module.startBodyIndex < startBodyIndex &&
          module.endIndex > endIndex
      ),
      module.startBodyIndex
    )

    const childMatches = childIndices.some((module) =>
      cb.hasMatch(module, $, memo)
    )

    if (match || childMatches) {
      for (const iterator of match?.options || [$]) {
        const out = commentIterator(
          (refModule ? og.src : src).slice(
            module.startBodyIndex,
            module.endIndex
          ),
          childIndices,
          {
            callbacks: cb,
            originals: og,
            iterator,
            memo: match?.memo,
            capture: !!match?.options,
          }
        )

        if (out) {
          strings.push(indent + out)
        }
      }
    }

    const nextModule = parentIndices[index + 1]

    if (nextModule && capture) {
      strings.push(
        cb.process(
          src.slice(
            ogModule.endIndex,
            nextModule.startCommentIndex
          ),
          $,
          memo
        )
      )
    }
  }

  if (parentIndices.length && capture) {
    const lastModule =
      parentIndices[parentIndices.length - 1]

    strings.push(
      cb.process(
        src.slice(lastModule.endIndex, -1),
        $,
        memo
      )
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
  options?: CommentBlockIndicesOptions
): CommentBlockIndices[] {
  const $ = options || defaultIndicesOptions

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

    if (newStr !== str || newStr === undefined) {
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

export function validateParamsMerge(
  module?: CommentBlockIndices,
  iterator?: CommentBlockIteratorOptions
) {
  if (iterator?.params && module?.params) {
    for (const key in iterator.params) {
      if (
        !iterator.params[key]?.optional &&
        module.params[key]?.optional
      ) {
        throw new Error(
          `Block "${module.moduleName}" cannot have optional variable "${key}" because the variable is already required in a parent block.`
        )
      }
    }
  }
}

export default (
  str: string,
  options?: {
    callbacks?: CommentBlockCallbackOptions
    indices?: CommentBlockIndicesOptions
    iterator?: CommentBlockIteratorOptions
    memo?: Record<string, any>
    capture?: boolean
  }
) => {
  return commentIterator(
    str,
    commentIndices(str, options?.indices),
    options
  )
}
