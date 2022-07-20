import lineStates from "helpers/lineStates/lineStates"
import parseComment, {
  Comment,
  CommentParams,
} from "helpers/parseComment/parseComment"

export interface VisitCommentOptions {
  absPath?: string[]
  force?: boolean
  noInnerContent?: boolean
  noChildContent?: boolean
  params?: CommentParams
  paramsMemo?: CommentParams
  stateLog?: string[]
}

export function visitCommentModules(
  lines: string[],
  path: string[],
  callback: (
    body: string,
    options: VisitCommentOptions
  ) => string | undefined,
  options?: VisitCommentOptions
): string | undefined {
  const output: string[] = []

  let noChildContent =
    options?.noChildContent === undefined
      ? true
      : options?.noChildContent

  let noInnerContent = true

  let lastComment: Comment

  while (lines.length) {
    const line = lines.shift()

    if (line === undefined) {
      break
    }

    const comment = parseComment(line)

    const absPath = [
      ...(options?.absPath || []),
      ...(lastComment ? [lastComment.name] : []),
    ]

    const states = lineStates({
      comment,
      lastComment,
      line,
      path,
      absPath,
    })

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
          paramsMemo: {
            ...options?.paramsMemo,
            ...comment.params,
          },
        }
      )

      if (out) {
        noChildContent = false
        noInnerContent = false
        output.push(out)
      }
    }
  }

  return output.length
    ? callback(output.join("\n"), {
        params: lastComment?.params,
        ...options,
        absPath: [
          ...(options?.absPath || []),
          ...(lastComment ? [lastComment.name] : []),
        ],
        force: options?.force || lastComment?.force,
        paramsMemo: {
          ...options?.paramsMemo,
          ...lastComment?.params,
        },
        noChildContent,
        noInnerContent,
      })
    : undefined
}
