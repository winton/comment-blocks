import lineIndent from "helpers/lineIndent/lineIndent"
import { parseCommentParams } from "plainHtml"

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

export interface VisitCommentOptions {
  absPath: string[]
  startPath: string[]
}

export type VisitCommentLineStates = (
  | "before comment"
  | "valid path"
  | "comment"
  | "body"
  | "end"
  | "inner comment"
)[]

export function visitCommentModules(
  lines: string[],
  path: string[],
  callback: (
    body: string,
    options: VisitCommentOptions
  ) => string,
  options?: VisitCommentOptions
): string | undefined {
  const output: string[] = []

  let lastComment: CommentTemplateComment

  while (lines.length) {
    const line = lines.shift()

    if (line === undefined) {
      break
    }

    const comment = parseComment(line)
    const states = lineStates({
      comment,
      lastComment,
      line,
      path,
    })

    const invalid =
      states.includes("before comment") ||
      !states.includes("valid path")

    if (states.includes("comment") && comment) {
      lastComment = comment
    }

    if (states.includes("body") && !invalid) {
      output.push(line)
    }

    if (states.includes("end")) {
      lines.unshift(line)
      break
    }

    if (
      states.includes("inner comment") &&
      comment &&
      !invalid
    ) {
      lines.unshift(line)

      const out = visitCommentModules(
        lines,
        path.slice(1),
        callback,
        {
          absPath: [
            ...(options?.absPath || [path[0]]),
            comment.module,
          ],
          startPath: options?.startPath || path,
        }
      )

      if (out) {
        output.push(out)
      }
    }
  }

  return output.length
    ? callback(
        output.join("\n"),
        options || {
          absPath: [path[0]],
          startPath: path,
        }
      )
    : undefined
}

export function lineStates({
  comment,
  lastComment,
  line,
  path,
}: {
  comment: CommentTemplateComment
  lastComment: CommentTemplateComment
  line: string
  path: string[]
}) {
  const states: VisitCommentLineStates = []

  if (!comment && !lastComment) {
    states.push("before comment")
  }

  if (
    !path[0] ||
    path[0] === (lastComment || comment)?.module
  ) {
    states.push("valid path")
  }

  if (lastComment) {
    const indent = lineIndent(line)

    if (
      indent < lastComment.spaces ||
      (indent === lastComment.spaces &&
        comment &&
        comment !== lastComment)
    ) {
      states.push("end")
    }

    if (
      indent > lastComment.spaces &&
      comment &&
      comment !== lastComment
    ) {
      states.push("inner comment")
    }
  }

  if (!states.includes("inner comment") && comment) {
    states.push("comment")
  }

  if (!states.includes("end") && !comment && lastComment) {
    states.push("body")
  }

  return states
}
