import lineIndent from "helpers/lineIndent/lineIndent"
import { parseCommentParams } from "plainHtml"

export type CommentTemplateBlock = {
  module: string
  blocks?: CommentTemplateBlock[]
  values?: Record<string, any>
  string?: string
}

export type CommentTemplateComment =
  | {
      module: string
      params: CommentTemplateParam[] | undefined
      spaces: number
    }
  | undefined

export interface CommentTemplateParam {
  key: string
  value: string
  optional: boolean
}

export function parseComment(line: string) {
  const match = line.match(
    /(\s*)<!---\s([^\[|]+)(.*)\s--->/
  )

  if (match) {
    const spaces = match[1].length
    const module = match[2].trim()
    const rawParams = match[3]

    const params = parseCommentParams(rawParams)

    return { module, params, spaces }
  }

  return
}

export function visitCommentModules(
  lines: string[],
  path: string[],
  fn: (path: string[], body: string) => string,
  ogPath?: string[]
): string | undefined {
  const result: string[] = []

  let comment: CommentTemplateComment
  let commentIndent: number | undefined

  while (lines.length) {
    const line = lines.shift()

    if (line === undefined) {
      break
    }

    const indent = lineIndent(line)

    if (
      comment &&
      commentIndent &&
      indent < commentIndent
    ) {
      lines.unshift(line)
      break
    }

    const newComment = parseComment(line)

    if (!comment && newComment) {
      if (path[0] && newComment.module !== path[0]) {
        break
      }

      comment = newComment
      commentIndent = lineIndent(line)
    }

    if (comment && newComment && comment !== newComment) {
      lines.unshift(line)

      const out = visitCommentModules(
        lines,
        path.slice(1),
        fn,
        path
      )

      if (out) {
        result.push(out)
      }
    } else if (newComment) {
      result.push(
        `${" ".repeat(newComment.spaces)}<!--- ${
          newComment.module
        } --->`
      )
    } else {
      result.push(line)
    }
  }

  return result.length
    ? fn(ogPath || path, result.join("\n"))
    : undefined
}
