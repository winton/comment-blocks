import lineStates from "helpers/lineStates/lineStates"
import parseComment, {
  Comment,
  CommentParams,
} from "helpers/parseComment/parseComment"

export interface VisitCommentOptions {
  absPath?: string[]
  noContent?: boolean
  params?: CommentParams
  paramsMemo?: CommentParams
  startPath?: string[]
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

  let noContent = true
  let lastComment: Comment

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

    if (options?.stateLog) {
      options?.stateLog.push(
        `${line}\t[ ${states.join(", ")} ]`
      )
    }

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
          ...options,
          absPath: [
            ...(options?.absPath ||
              (lastComment?.name
                ? [lastComment?.name]
                : [])),
            comment.name,
          ],
          params: comment.params,
          paramsMemo: {
            ...options?.paramsMemo,
            ...comment.params,
          },
          startPath: options?.startPath || path,
        }
      )

      if (out) {
        noContent = false
        output.push(out)
      }
    }
  }

  return output.length
    ? callback(output.join("\n"), {
        absPath: lastComment?.name
          ? [lastComment?.name]
          : [],
        params: lastComment?.params,
        startPath: path,
        ...options,
        paramsMemo: {
          ...options?.paramsMemo,
          ...lastComment?.params,
        },
        noContent,
      })
    : undefined
}
