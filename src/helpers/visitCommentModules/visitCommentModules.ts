import compareArrays from "helpers/compareArrays/compareArrays"
import lineStates from "helpers/lineStates/lineStates"
import parseComment, {
  Comment,
  CommentParams,
} from "helpers/parseComment/parseComment"

export interface VisitCommentOptions {
  absPath?: string[]
  force?: boolean
  refMatch?: [string, string[]]
  refs?: [string, string[]][]
  noChildContent?: boolean
  params?: CommentParams
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
  const rawOutput: string[] = []

  let noChildContent =
    options?.noChildContent === undefined
      ? true
      : options?.noChildContent

  let lastComment: Comment

  const refs =
    options?.refs ||
    (lines
      .map((line) => {
        const ref = parseComment(line)?.ref
        return ref ? [line, ref] : undefined
      })
      .filter((ref) => ref) as [string, string[]][])

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
      rawOutput.push(line)
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
          refMatch: refs.find(([, path]) =>
            compareArrays(absPath, path)
          ),
          refs,
        }
      )

      if (out) {
        noChildContent = false
        output.push(out)
        rawOutput.push(out)
      }
    }
  }

  if (output.length) {
    const absPath = [
      ...(options?.absPath || []),
      ...(lastComment?.name ? [lastComment.name] : []),
    ]

    return callback(rawOutput.join("\n"), output, {
      params: lastComment?.params,
      ...options,
      absPath,
      force: options?.force || lastComment?.force,
      noChildContent,
      refMatch: refs.find(([, path]) =>
        compareArrays(absPath, path)
      ),
      refs,
    })
  }

  return undefined
}
