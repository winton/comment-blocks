import compareArrays from "helpers/compareArrays/compareArrays"
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
  path: string[],
  template: string,
  blocks: Blocks,
  options?: {
    debug?: boolean
    ignoreRefs?: boolean
    params?: CommentParams
    stateLog?: string[]
    values?: Record<string, any>
  }
): string | undefined {
  const lines = squashComments(template).split("\n")

  return visitCommentModules(
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

          if (isParent || (isMatch && comment.ref)) {
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

      if (comment.ref && !options?.ignoreRefs) {
        return plainHtml(
          comment.ref,
          template,
          [{ path: [], values }],
          { ignoreRefs: true }
        )
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

          let matchesAll = true
          let noParams = true

          if (params) {
            for (const key in params) {
              if (!params[key].optional) {
                noParams = false

                if (finalValues[key] === undefined) {
                  matchesAll = false
                }
              }
            }
          }

          if (options?.debug) {
            console.debug([
              block.isMatch,
              matchesAll,
              finalHtml !== html,
              !hasMatch && comment.force,
            ])
          }

          if (
            matchesAll &&
            (block.isMatch ||
              noParams ||
              finalHtml !== html ||
              (!hasMatch && comment.force))
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
        return out.join("\n")
      }

      return undefined
    },
    { stateLog: options?.stateLog }
  )
}

export default plainHtml
