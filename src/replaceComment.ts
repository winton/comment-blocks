import { CommentIndicesResult } from "commentIndices"

export default (
  src: string,
  replace: string,
  commentIndices: CommentIndicesResult,
  offset = 0
): [string, number] => {
  const startIndex =
    commentIndices.startCommentIndex - offset

  const endIndex = commentIndices.endIndex - offset

  return [
    src.slice(0, startIndex) +
      replace +
      src.slice(endIndex, -1),
    offset + (endIndex - startIndex - replace.length),
  ]
}
