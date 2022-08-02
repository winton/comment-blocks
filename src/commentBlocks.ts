export interface CommentBlockOptions {
  show?: boolean
  params?: Record<string, string>
  values?: Record<string, string>
}

export interface CommentBlockCallbacks {
  match?: (
    comment: {
      moduleName: string
      params: Record<string, string>
    },
    options: CommentBlockOptions
  ) => CommentBlockOptions[] | undefined

  process?: (
    str: string,
    options: CommentBlockOptions
  ) => string
}

export interface CommentBlockIndices {
  commentBody: string
  indent: number
  startCommentIndex: number
  startBodyIndex: number
  endIndex: number
}

export const defaultCallbacks: Required<CommentBlockCallbacks> =
  {
    process: (str) => str,
    match: () => [{ show: true }],
  }

export const defaultOptions: Required<CommentBlockOptions> =
  {
    show: false,
    params: {},
    values: {},
  }

export function commentIterator(
  src: string,
  indices: CommentBlockIndices[],
  callbacks: CommentBlockCallbacks = {},
  options: CommentBlockOptions = {}
): string | undefined {
  const $ = {
    ...defaultOptions,
    ...options,
  } as Required<CommentBlockOptions>

  const cb = {
    ...defaultCallbacks,
    ...callbacks,
  } as Required<CommentBlockCallbacks>

  if (indices.length === 0 && $.show) {
    return cb.process(src, $)
  }

  const minIndent = Math.min(
    ...indices.map(({ indent }) => indent)
  )

  const minIndentMatches = indices.filter(
    ({ indent }) => indent === minIndent
  )

  if (!minIndentMatches.length && $.show) {
    return cb.process(src, $)
  }

  const strings = []

  let index = -1

  for (const module of minIndentMatches) {
    index++

    if (index === 0 && $.show) {
      strings.push(
        cb.process(
          src.slice(0, module.startCommentIndex),
          $
        )
      )
    }

    const paramPieces =
      module.commentBody.split(/\s*[,\n]\s*/)

    const moduleName = paramPieces.shift()

    if (!moduleName) {
      continue
    }

    const params = paramPieces
      .map((piece) => piece.split(/\s*:\s*/))
      .reduce((memo, [key, value]) => {
        memo[key] = value
        return memo
      }, {} as Record<string, string>)

    const matches = cb.match({ moduleName, params }, $)

    const body = src.slice(
      module.startBodyIndex,
      module.endIndex
    )

    const offset = module.startBodyIndex

    const children = indices
      .filter(
        ({ indent, startCommentIndex, endIndex }) =>
          indent >= module.indent &&
          module.startBodyIndex < startCommentIndex &&
          module.endIndex > endIndex
      )
      .map(
        (module): CommentBlockIndices => ({
          ...module,
          endIndex: module.endIndex - offset,
          startBodyIndex: module.startBodyIndex - offset,
          startCommentIndex:
            module.startCommentIndex - offset,
        })
      )

    for (const match of matches || [undefined]) {
      const out = commentIterator(body, children, cb, match)

      if (out) {
        strings.push(" ".repeat(module.indent) + out)
      }
    }

    const nextModule = minIndentMatches[index + 1]

    if (options.show) {
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

  return strings.join("\n").trim()
}

export function commentIndices(
  str: string,
  commentStart = "<!--",
  commentEnd = "-->",
  nameKey = "mod"
): CommentBlockIndices[] {
  const commentRegex = new RegExp(
    `${commentStart}\\s*${nameKey}: (.*?)${commentEnd}\\s*\\n(\\s*)`,
    "gms"
  )

  const results = []
  let result

  while ((result = commentRegex.exec(str)) !== null) {
    const searchStr =
      result[2] + str.slice(commentRegex.lastIndex)

    const endIndex = searchStr.search(
      new RegExp(
        `^(\\s{0,${result[2].length - 1}}[^\\s]|\\s{0,${
          result[2].length
        }}<!--\\s*${nameKey}:\\s)`,
        "gms"
      )
    )

    results.push({
      commentBody: result[1].trim(),
      indent: result[2].length,
      startCommentIndex:
        commentRegex.lastIndex - result[0].length,
      startBodyIndex: commentRegex.lastIndex,
      endIndex:
        commentRegex.lastIndex +
        (endIndex === -1 ? searchStr.length : endIndex) -
        result[2].length,
    })
  }

  return results
}

export default (
  str: string,
  callbacks: CommentBlockCallbacks
) => {
  return commentIterator(
    str,
    commentIndices(str),
    callbacks
  )
}
