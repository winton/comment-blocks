import { CommentIndicesResult } from "commentIndices"
import replaceParams from "replaceParams"

export interface CommentIteratorOptions {
  force?: boolean
  params?: Record<string, string>
  values?: Record<string, string>
}

export const commentIterator2 = (
  src: string,
  indices: CommentIndicesResult[],
  matchValuesCallback: (
    moduleName: string,
    params: Record<string, string>,
    options: CommentIteratorOptions
  ) => CommentIteratorOptions[] | undefined,
  options: CommentIteratorOptions = {}
): string | undefined => {
  const $ = {
    force: false,
    params: {},
    values: {},
    ...options,
  } as Required<typeof options>

  if (indices.length === 0 && $.force) {
    return replaceParams(src, $.params, $.values)
  }

  const minIndent = Math.min(
    ...indices.map(({ indent }) => indent)
  )

  const minIndentMatches = indices.filter(
    ({ indent }) => indent === minIndent
  )

  if (!minIndentMatches.length && $.force) {
    return replaceParams(src, $.params, $.values)
  }

  const strings = []

  let index = -1

  for (const module of minIndentMatches) {
    index++

    if (index === 0 && $.force) {
      strings.push(
        replaceParams(
          src.slice(0, module.startCommentIndex),
          $.params,
          $.values
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

    const matches = matchValuesCallback(
      moduleName,
      params,
      $
    )

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

    if (matches?.length) {
      for (const match of matches) {
        const out = commentIterator2(
          body,
          children,
          matchValuesCallback,
          match
        )
        if (out) {
          strings.push(" ".repeat(module.indent) + out)
        }
      }
    } else {
      const out = commentIterator2(
        body,
        children,
        matchValuesCallback,
        {}
      )
      if (out) {
        strings.push(" ".repeat(module.indent) + out)
      }
    }

    const nextModule = minIndentMatches[index + 1]

    if (options.force) {
      if (nextModule) {
        strings.push(
          replaceParams(
            src.slice(
              module.endIndex,
              nextModule.startCommentIndex
            ),
            $.params,
            $.values
          )
        )
      } else {
        strings.push(
          replaceParams(
            src.slice(module.endIndex, -1),
            $.params,
            $.values
          )
        )
      }
    }
  }

  return strings.join("\n").trim()
}

export default commentIterator2
