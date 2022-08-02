export interface CommentIndicesResult {
  commentBody: string
  indent: number
  startCommentIndex: number
  startBodyIndex: number
  endIndex: number
}

export const commentTypes = {
  html: ["<!--", "-->"],
  js: ["/*", "*/"],
  sql: ["/*", "*/"],
}

export default (
  str: string,
  options: {
    commentType?: keyof typeof commentTypes
    moduleNameKey?: string
  } = {}
): CommentIndicesResult[] => {
  const $ = {
    commentType: "html",
    moduleNameKey: "mod",
    ...options,
  } as Required<typeof options>

  const [commentStart, commentEnd] =
    commentTypes[$.commentType]

  const commentRegex = new RegExp(
    `${commentStart}\\s*${$.moduleNameKey}: (.*?)${commentEnd}\\s*\\n(\\s*)`,
    "gms"
  )

  const results = []
  let result

  while ((result = commentRegex.exec(str)) !== null) {
    const searchStr =
      result[2] + str.slice(commentRegex.lastIndex)

    const endIndex = searchStr.search(
      new RegExp(
        `^(\\s{0,${result[2].length - 1}}[^\\s]|\\s{0,${
          result[2].length
        }}<!--\\s*${$.moduleNameKey}:\\s)`,
        "gms"
      )
    )

    results.push({
      commentBody: result[1].trim(),
      indent: result[2].length,
      startCommentIndex:
        commentRegex.lastIndex - result[0].length,
      startBodyIndex: commentRegex.lastIndex,
      endIndex:
        commentRegex.lastIndex +
        (endIndex === -1 ? searchStr.length : endIndex) -
        result[2].length,
    })
  }

  return results
}
