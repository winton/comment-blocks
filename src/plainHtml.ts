import compareArrays from "helpers/compareArrays/compareArrays"
import { CommentParams } from "helpers/parseComment/parseComment"
import replaceParams from "helpers/replaceParams/replaceParams"
import squashComments from "helpers/squashComments/squashComments"
import { visitCommentModules } from "helpers/visitCommentModules/visitCommentModules"

export type Blocks = {
  path?: string[]
  params?: CommentParams
  values?: Record<string, any>
  string?: string
}[]

export function plainHtml(
  path: string[],
  template: string,
  blocks: Blocks,
  options?: {
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
      const out = blocks.reduce((memo, block) => {
        const blockPath = [...path, ...(block.path || [])]

        if (
          compareArrays(
            blockPath,
            comment.absPath?.slice(0, blockPath.length)
          )
        ) {
          const html = block.string || body

          const params = {
            ...comment.paramsMemo,
            ...options?.params,
            ...block?.params,
          }

          const values = {
            ...options?.values,
            ...block.values,
          }

          const out = replaceParams(html, params, values)

          if (html !== out || !comment.noInnerContent) {
            memo.push(out)
          }
        }

        return memo
      }, [] as string[])

      const out2 = out.length
        ? []
        : blocks.reduce((memo, block) => {
            const blockPath = [
              ...path,
              ...(block.path || []),
            ]

            if (
              compareArrays(
                blockPath.slice(
                  0,
                  comment.absPath?.length || 0
                ),
                comment.absPath
              )
            ) {
              memo.push(block.string || body)
            }

            return memo
          }, [] as string[])

      return out.length
        ? out.join("\n")
        : out2.length
        ? out2.join("\n")
        : undefined
    },
    { stateLog: options?.stateLog }
  )
}

export default plainHtml
