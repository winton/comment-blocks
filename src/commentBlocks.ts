import { CommentIndicesResult } from "commentIndices"

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

export const commentIterator = (
  src: string,
  indices: CommentIndicesResult[],
  callbacks: CommentBlockCallbacks = {},
  options: CommentBlockOptions = {}
): string | undefined => {
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
        (module): CommentIndicesResult => ({
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

export default commentIterator
