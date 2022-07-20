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
      let childMatch = false
      let parentMatch = false
      let paramsMemo: CommentParams = {}
      let valuesMemo: Record<string, any> = {}

      const out = blocks.reduce((memo, block) => {
        const blockPath = [...path, ...(block.path || [])]

        const exactMatch = compareArrays(
          blockPath,
          comment.absPath
        )

        childMatch ||=
          !exactMatch &&
          compareArrays(
            blockPath,
            comment.absPath?.slice(0, blockPath.length)
          )

        parentMatch ||=
          !exactMatch &&
          compareArrays(
            blockPath.slice(
              0,
              comment.absPath?.length || 0
            ),
            comment.absPath
          )

        if (exactMatch || childMatch) {
          paramsMemo = {
            ...paramsMemo,
            ...block.params,
          }
          valuesMemo = {
            ...valuesMemo,
            ...block.values,
          }
        }

        if (exactMatch) {
          const html = block.string || body

          const params = {
            ...comment.paramsMemo,
            ...options?.params,
            ...paramsMemo,
          }

          const values = {
            ...options?.values,
            ...valuesMemo,
          }

          const out = replaceParams(html, params, values)

          if (
            html !== out ||
            !comment.noInnerContent ||
            comment.force
          ) {
            memo.push(out)
          }
        }

        return memo
      }, [] as string[])

      if (childMatch) {
        return replaceParams(
          body,
          {
            ...comment.paramsMemo,
            ...options?.params,
            ...paramsMemo,
          },
          {
            ...options?.values,
            ...valuesMemo,
          }
        )
      } else if (parentMatch) {
        return body
      }

      return out.length ? out.join("\n") : undefined
    },
    { stateLog: options?.stateLog }
  )
}

export default plainHtml
