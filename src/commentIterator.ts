import { CommentIndicesResult } from "commentIndices"
import extractComment from "extractComment"
import replaceParams from "replaceParams"

export interface CommentIteratorOptions {
  parentMatch?: boolean
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
    parentMatch: false,
    params: {},
    values: {},
    ...options,
  } as Required<typeof options>

  if (indices.length === 0) {
    return replaceParams(src, $.params, $.values)
  }

  const minIndent = Math.min(
    ...indices.map(({ indent }) => indent)
  )

  const minIndentMatches = indices.filter(
    ({ indent }) => indent === minIndent
  )

  if (!minIndentMatches.length) {
    return replaceParams(src, $.params, $.values)
  }

  const strings = []

  let index = -1

  for (const module of minIndentMatches) {
    index++

    if (index === 0) {
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

    if (!matches?.length && !options.parentMatch) {
      continue
    }

    const body = extractComment(src, module)
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
          {
            parentMatch: true,
            params: { ...$.params, ...match.params },
            values: { ...$.values, ...match.values },
          }
        )
        if (out) {
          strings.push(" ".repeat(module.indent) + out)
        }
      }
    } else if (options.parentMatch) {
      const out = commentIterator2(
        body,
        children,
        matchValuesCallback,
        $
      )
      if (out) {
        strings.push(" ".repeat(module.indent) + out)
      }
    }

    const nextModule = minIndentMatches[index + 1]

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

  return strings.join("\n").trim()
}

// export const commentIterator = (
//   src: string,
//   indices: CommentIndicesResult[],
//   matchValuesCallback: (
//     moduleName: string,
//     params: Record<string, string>,
//     options: CommentIteratorOptions
//   ) => CommentIteratorOptions[] | undefined,
//   options: CommentIteratorOptions = {}
// ): string | undefined => {
//   if (indices.length === 0) {
//     return
//   }

//   let tmpSrc = src
//   let offset = 0
//   const ogOffset = offset

//   const $ = {
//     parentMatch: false,
//     params: {},
//     values: {},
//     ...options,
//   } as Required<typeof options>

//   const minIndent = Math.min(
//     ...indices.map(({ indent }) => indent)
//   )

//   const minIndentMatches = indices.filter(
//     ({ indent }) => indent === minIndent
//   )

//   const matches = minIndentMatches.map((module) => {
//     const paramPieces =
//       module.commentBody.split(/\s*[,\n]\s*/)

//     const moduleName = paramPieces.shift()

//     if (!moduleName) {
//       return
//     }

//     const params = paramPieces
//       .map((piece) => piece.split(/\s*:\s*/))
//       .reduce((memo, [key, value]) => {
//         memo[key] = value
//         return memo
//       }, {} as Record<string, string>)

//     const matches = matchValuesCallback(
//       moduleName,
//       params,
//       $
//     )

//     if (matches || $.parentMatch) {
//       const replacement = `$!-!-${moduleName}-!-!$`

//       const [result, newOffset] = replaceComment(
//         tmpSrc,
//         replacement,
//         module,
//         offset
//       )

//       offset = newOffset
//       tmpSrc = result

//       return {
//         ...module,
//         moduleName,
//         matches,
//       }
//     }

//     return
//   })

//   offset = ogOffset

//   return matches
//     .filter((m) => !!m)
//     .map((module) => {
//       if (!module || !module.matches) {
//         throw new Error("this can't happen")
//       }

//       const children = indices.filter(
//         ({ indent, startCommentIndex, endIndex }) =>
//           indent >= module.indent &&
//           module.startBodyIndex < startCommentIndex &&
//           module.endIndex > endIndex
//       )

//       const [body, newOffset] = extractComment(
//         src,
//         module,
//         offset
//       )

//       const results = module.matches.map((match) =>
//         commentIterator(
//           body,
//           children,
//           matchValuesCallback,
//           match
//         )
//       )

//       tmpSrc = tmpSrc.replace(
//         new RegExp(
//           escapeRegExp(`$!-!-${module.moduleName}-!-!$`),
//           "g"
//         ),
//         results.join("\n")
//       )

//       return tmpSrc
//     })
//     .join("\n")
// }

export default commentIterator2
