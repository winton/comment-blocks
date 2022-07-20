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
    params?: CommentParams
    stateLog?: string[]
    values?: Record<string, any>
  }
): string | undefined {
  const lines = squashComments(template).split("\n")

  return visitCommentModules(
    lines,
    path,
    (body, comment) => {
      let valuesMemo: Record<string, any> = {}

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
              blockPath,
              comment.absPath?.slice(0, blockPath.length)
            )

          const isParent =
            !isMatch &&
            compareArrays(
              blockPath.slice(
                0,
                comment.absPath?.length || 0
              ),
              comment.absPath
            )

          if (isMatch || isChild) {
            valuesMemo = {
              ...valuesMemo,
              ...block.values,
            }
          }

          memo.push({
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
        console.debug({ comment, blockMatches, valuesMemo })
      }

      const out = blockMatches.reduce((memo, block) => {
        const hasContent = !comment.noChildContent

        if (block.isMatch || block.isChild) {
          const html = block.isMatch
            ? block.string || body
            : body

          const params = {
            ...comment.paramsMemo,
            ...options?.params,
          }

          const values = {
            ...options?.values,
            ...valuesMemo,
          }

          const out = replaceParams(html, params, values)

          if (
            block.isMatch ||
            html !== out ||
            hasContent ||
            (block.isChild && comment.force)
          ) {
            memo.push(out)
          }
        } else if (
          block.isParent &&
          hasContent &&
          !memo.length
        ) {
          memo.push(body)
        }

        return memo
      }, [] as string[])

      if (options?.debug) {
        console.debug(
          out.length,
          out.join("\n").slice(0, 100)
        )
      }

      return out.length ? out.join("\n") : undefined
    },
    { stateLog: options?.stateLog }
  )
}

export default plainHtml
