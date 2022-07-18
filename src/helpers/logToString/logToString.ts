import { CommentTemplateLog } from "plainHtml"

export default (log: CommentTemplateLog) => {
  const maxMsg = Math.max(
    ...log.map(({ msg }) => msg.length)
  )
  const maxLineIndex = Math.max(
    ...log.map(
      ({ lineIndex }) => lineIndex.toString().length
    )
  )
  const maxDepth = Math.max(
    ...log.map(({ depth }) => depth.toString().length)
  )
  return log
    .map(
      (v) =>
        `${v.depth}${" ".repeat(
          maxDepth + 2 - v.depth.toString().length
        )}${v.msg}${" ".repeat(maxMsg + 2 - v.msg.length)}${
          v.lineIndex
        }${" ".repeat(
          maxLineIndex + 2 - v.lineIndex.toString().length
        )}${v.line}`
    )
    .join("\n")
}
