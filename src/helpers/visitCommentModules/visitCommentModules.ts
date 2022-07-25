import lineStates from "helpers/lineStates/lineStates"
import parseComment, {
  Comment,
  CommentParams,
} from "helpers/parseComment/parseComment"

export interface VisitCommentOptions {
  absPath?: string[]
  force?: boolean
  noChildContent?: boolean
  params?: CommentParams
  ref?: string[]
  stateLog?: string[]
}

export function visitCommentModules(
  lines: string[],
  path: string[],
  callback: (
    html: string,
    lines: string[],
    options: VisitCommentOptions
  ) => string | undefined,
  options?: VisitCommentOptions
): string | undefined {
  const output: string[] = []

  let noChildContent =
    options?.noChildContent === undefined
      ? true
      : options?.noChildContent

  let lastComment: Comment
  let hasRef = false

  while (lines.length) {
    const line = lines.shift()

    if (line === undefined) {
      break
    }

    const comment = parseComment(line)

    const absPath = [
      ...(options?.absPath || []),
      ...(lastComment?.name ? [lastComment.name] : []),
    ]

    const states = lineStates({
      comment,
      lastComment,
      line,
      path,
      absPath,
    })

    if (
      states.includes("comment") &&
      states.includes("valid path") &&
      comment?.ref
    ) {
      hasRef = true
    }

    if (states.includes("empty")) {
      continue
    }

    if (options?.stateLog) {
      options?.stateLog.push(
        `${line}\t[ ${states.join(", ")} ]`
      )
    }

    if (states.includes("comment") && comment) {
      lastComment = comment
    }

    if (
      states.includes("body") &&
      !states.includes("before comment") &&
      states.includes("valid path")
    ) {
      output.push(line)
    }

    if (states.includes("end")) {
      lines.unshift(line)
      break
    }

    if (states.includes("inner comment") && comment) {
      lines.unshift(line)

      const out = visitCommentModules(
        lines,
        path,
        callback,
        {
          ...options,
          absPath,
          force: comment.force,
          params: comment.params,
          ref: comment.ref,
        }
      )

      if (out) {
        noChildContent = false
        output.push(out)
      }
    }
  }

  if (output.length || hasRef) {
    const absPath = [
      ...(options?.absPath || []),
      ...(lastComment?.name ? [lastComment.name] : []),
    ]

    return callback(output.join("\n"), output, {
      params: lastComment?.params,
      ref: lastComment?.ref,
      ...options,
      absPath,
      force: options?.force || lastComment?.force,
      noChildContent,
    })
  }

  return undefined
}
