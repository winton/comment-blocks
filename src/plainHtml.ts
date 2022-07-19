import compareArrays from "helpers/compareArrays/compareArrays"
import { CommentParams } from "helpers/parseComment/parseComment"
import replaceParams from "helpers/replaceParams/replaceParams"
import squashComments from "helpers/squashComments/squashComments"
import { visitCommentModules } from "helpers/visitCommentModules/visitCommentModules"

export type Blocks = {
  path: string[]
  params?: CommentParams
  values?: Record<string, any>
  string?: string
}[]

export function plainHtml(
  template: string,
  blocks: Blocks,
  options?: {
    path?: string[]
    params?: CommentParams
    values?: Record<string, any>
  }
): string | undefined {
  const lines = squashComments(template).split("\n")
  const path = options?.path || []

  return visitCommentModules(
    lines,
    path,
    (body, comment) => {
      const out = blocks.reduce((memo, block) => {
        if (
          compareArrays(
            [...path, ...block.path],
            comment.absPath
          )
        ) {
          const out = replaceParams(
            block.string || body,
            {
              ...comment.params,
              ...options?.params,
              ...block?.params,
            },
            {
              ...options?.values,
              ...block.values,
            }
          )

          if (out !== undefined) {
            memo.push(out)
          }
        }

        return memo
      }, [] as string[])

      return out.length ? out.join("\n") : undefined
    }
  )
}

export default plainHtml
