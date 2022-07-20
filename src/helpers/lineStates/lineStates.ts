import compareArrays from "helpers/compareArrays/compareArrays"
import lineIndent from "helpers/lineIndent/lineIndent"
import { Comment } from "helpers/parseComment/parseComment"

export type LineStates = (
  | "empty"
  | "before comment"
  | "valid path"
  | "comment"
  | "body"
  | "end"
  | "inner comment"
)[]

export default ({
  comment,
  lastComment,
  line,
  path,
  absPath,
}: {
  comment: Comment
  lastComment: Comment
  line: string
  path: string[]
  absPath: string[] | undefined
}) => {
  const states: LineStates = []

  if (line.length === 0) {
    states.push("empty")
  }

  if (!comment && !lastComment) {
    states.push("before comment")
  }

  if (
    compareArrays(
      path,
      (absPath || []).slice(0, path.length)
    )
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

  if (
    !states.includes("end") &&
    !states.includes("inner comment") &&
    comment
  ) {
    states.push("comment")
  }

  if (!states.includes("end") && !comment && lastComment) {
    states.push("body")
  }

  return states
}
