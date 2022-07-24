import compareArrays from "helpers/compareArrays/compareArrays"
import escapeRegExp from "helpers/escapeRegExp/escapeRegExp"
import { CommentParams } from "helpers/parseComment/parseComment"
import replaceParams from "helpers/replaceParams/replaceParams"
import squashComments from "helpers/squashComments/squashComments"
import { visitCommentModules } from "helpers/visitCommentModules/visitCommentModules"

export type Block = {
  path?: string[]
  params?: CommentParams
  values?: Record<string, any>
  string?: string
}

export type Blocks = Block[]

export function plainHtml(
  path: [string, ...string[]],
  template: string,
  blocks: Blocks,
  options?: {
    debug?: boolean
    params?: CommentParams
    stateLog?: string[]
    values?: Record<string, any>
  }
): string | undefined {
  const lines = squashComments(template).split("\n")
  const refValues: Record<string, string> = {}

  let out = visitCommentModules(
    lines,
    path,
    (html, lines, comment) => {
      const hasContent = !comment.noChildContent

      let valuesMemo: Record<string, any> = {}

      let hasMatch = false

      const blockMatches = blocks.reduce(
        (memo, block) => {
          const blockPath = [...path, ...(block.path || [])]

          const isMatch = compareArrays(
            blockPath,
            comment.absPath
          )

          const isChild =
            !isMatch &&
            compareArrays(
              blockPath.slice(
                0,
                comment.absPath?.length || 0
              ),
              comment.absPath
            )

          const isParent =
            !isMatch &&
            compareArrays(
              blockPath,
              comment.absPath?.slice(0, blockPath.length)
            )

          if (isParent) {
            valuesMemo = {
              ...valuesMemo,
              ...block.values,
            }
          }

          hasMatch ||= isMatch

          memo.push({
            ...block,
            isChild,
            isParent,
            isMatch,
            path: blockPath,
          })

          return memo
        },
        [] as (Block & {
          path: string[]
          isChild: boolean
          isParent: boolean
          isMatch: boolean
        })[]
      )

      if (options?.debug) {
        console.debug({
          comment,
          blockMatches,
          hasMatch,
        })
      }

      const params = {
        ...comment?.params,
        ...options?.params,
      }

      const values = {
        ...options?.values,
        ...valuesMemo,
      }

      const out = blockMatches.reduce((memo, block) => {
        if (
          block.isMatch ||
          (!hasMatch && block.isParent && !memo.length)
        ) {
          const finalLines: string[] = []
          const finalParams = { ...params, ...block.params }
          const finalValues = { ...values, ...block.values }

          if (options?.debug) {
            console.debug({
              block,
              finalParams,
              finalValues,
            })
          }

          if (block.isMatch && block.string) {
            finalLines.push(
              replaceParams(
                block.string,
                finalParams,
                finalValues
              )
            )
          } else {
            finalLines.push(
              replaceParams(
                lines.join("\n"),
                finalParams,
                finalValues
              )
            )
          }

          const finalHtml = finalLines.join("\n")

          let paramCount = 0

          if (params) {
            for (const key in params) {
              if (!params[key].optional) {
                paramCount++
              }
            }
          }

          if (options?.debug) {
            console.debug([
              block.isMatch,
              paramCount === 0,
              finalHtml !== html,
              !hasMatch && comment.force,
            ])
          }

          if (
            block.isMatch ||
            paramCount === 0 ||
            finalHtml !== html ||
            (!hasMatch && comment.force)
          ) {
            memo.push(finalHtml)
          }
        } else if (
          block.isChild &&
          !hasMatch &&
          hasContent &&
          !memo.length
        ) {
          memo.push(html)
        }

        return memo
      }, [] as string[])

      if (options?.debug) {
        console.debug(
          out.length,
          out.join("\n").slice(0, 100)
        )
      }

      if (out.length) {
        const finalOut = out.join("\n")

        if (comment.refMatch) {
          refValues[comment.refMatch] = finalOut
        }

        return finalOut
      }

      return undefined
    },
    { stateLog: options?.stateLog }
  )

  for (const line in refValues) {
    out = out?.replace(
      new RegExp("^" + escapeRegExp(line) + "$", "gm"),
      refValues[line]
    )
  }

  return out
}

export default plainHtml
