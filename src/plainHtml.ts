import { CommentParams } from "helpers/parseComment/parseComment"
import replaceParams from "helpers/replaceParams/replaceParams"
import squashComments from "helpers/squashComments/squashComments"
import { visitCommentModules } from "helpers/visitCommentModules/visitCommentModules"

export type Blocks = [
  {
    path: string[]
    values?: Record<string, any>
    string?: string
  }
][]

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

  return visitCommentModules(
    lines,
    options?.path || [],
    (body, comment) => replaceParams(body, options?.params)
  )
}

export default plainHtml
