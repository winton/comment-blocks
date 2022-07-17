import squashComments from "helpers/squashComments/squashComments"

export type CommentTemplateBlock = {
  blocks?: Record<
    string,
    CommentTemplateBlock | CommentTemplateBlock[]
  >
  params?: Record<string, any>
  string?: string
}

export type CommentTemplateComment =
  | {
      id: string
      params: CommentTemplateParam[] | undefined
      spaces: number
    }
  | undefined

export interface CommentTemplateParam {
  key: string
  value: string
  optional: boolean
}

export type CommentTemplateLog = {
  msg: string
  lineIndex: number
  line: string
}[]

export function commentTemplate(
  template: string,
  blocks: CommentTemplateBlock,
  options?: {
    params?: Record<string, any>
    log: CommentTemplateLog
  }
): string {
  const lines = squashComments(template).split("\n")

  const baseBody: string[] = []

  let baseBlock: CommentTemplateBlock | undefined =
    undefined

  let subBody: string[] = []

  let baseComment: CommentTemplateComment
  let subComment: CommentTemplateComment

  let lineIndex = 0

  for (const line of lines) {
    lineIndex++

    const newComment = parseComment(line)

    const lineIndentMatch = line.match(/^\s*/)
    const lineIndent = lineIndentMatch
      ? lineIndentMatch[0].length
      : 0

    // add line to body and continue if not a comment
    if (!newComment) {
      if (subComment) {
        subBody.push(line)
      } else {
        baseBody.push(line)
      }

      // clear sub comment if indent is less or equal
      if (
        subComment &&
        subBody.length > 2 &&
        lineIndent <= subComment.spaces
      ) {
        options?.log.push({
          msg: "sub comment clear",
          lineIndex,
          line,
        })

        const body = subBody.join("\n")

        if (baseBlock?.blocks) {
          const block = baseBlock.blocks[subComment.id]

          if (Array.isArray(block)) {
            for (const b of block) {
              baseBody.push(
                commentTemplate(body, b, options)
              )
            }
          } else if (block) {
            baseBody.push(
              commentTemplate(body, block, options)
            )
          }
        } else if (blocks.string) {
          baseBody.push(blocks.string)
        }

        subBody = []
        subComment = undefined
      }

      continue
    }

    // set base comment if not set or indent is equal
    if (
      !baseComment ||
      newComment.spaces === baseComment.spaces
    ) {
      options?.log.push({
        msg: "base comment set",
        lineIndex,
        line,
      })

      baseComment = newComment

      if (blocks.blocks) {
        baseBlock = blocks.blocks[
          baseComment.id
        ] as CommentTemplateBlock
      }

      baseBody.push(
        `${" ".repeat(baseComment.spaces)}<!--- ${
          baseComment.id
        } --->`
      )
    }

    // set sub comment if not set and base set and indent is higher
    if (
      !subComment &&
      baseComment &&
      newComment.spaces > baseComment.spaces
    ) {
      options?.log.push({
        msg: "sub comment set",
        lineIndex,
        line,
      })

      subComment = newComment
      subBody.push(
        `${" ".repeat(subComment.spaces)}<!--- ${
          subComment.id
        } --->`
      )
    }
  }

  return baseBody.join("\n")
}

export function parseComment(line: string) {
  const match = line.match(
    /(\s*)<!---\s([^\[|]+)(.*)\s--->/
  )

  if (match) {
    const spaces = match[1].length
    const id = match[2].trim()
    const rawParams = match[3]

    const params = parseCommentParams(rawParams)
    return { id, params, spaces }
  }

  return
}

export function parseCommentParams(rawParams: string) {
  return rawParams.match(/[^|]+/g)?.reduce((memo, str) => {
    const param = parseCommentParam(str)

    if (param) {
      memo.push(param)
    }

    return memo
  }, [] as CommentTemplateParam[])
}

export function parseCommentParam(rawParam: string) {
  const match = rawParam.match(
    /\s?([^\?:]+)(\?)?:\s?([^$]+)/
  )

  if (match) {
    const key = match[1]
    const optional = match[2] === "?"
    const value = match[3].trim()

    return { key, optional, value }
  }

  return
}

export default commentTemplate
