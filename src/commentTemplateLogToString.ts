import { CommentTemplateLog } from "commentTemplate"

export default (log: CommentTemplateLog) => {
  const maxMsg = Math.max(
    ...log.map(({ msg }) => msg.length)
  )
  const maxLineIndex = Math.max(
    ...log.map(
      ({ lineIndex }) => lineIndex.toString().length
    )
  )
  return log
    .map(
      (v) =>
        `${v.msg}${" ".repeat(maxMsg + 2 - v.msg.length)}${
          v.lineIndex
        }${" ".repeat(
          maxLineIndex + 2 - v.lineIndex.toString().length
        )}${v.line}`
    )
    .join("\n")
}
