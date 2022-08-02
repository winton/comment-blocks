import { CommentIndicesResult } from "commentIndices"

export default (
  src: string,
  commentIndices: CommentIndicesResult
): string => {
  return src.slice(
    commentIndices.startBodyIndex,
    commentIndices.endIndex
  )
}
