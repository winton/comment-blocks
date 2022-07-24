export type CommentParam = {
  value: string
  optional: boolean
}

export type CommentParams = Record<string, CommentParam>

export type Comment =
  | {
      name?: string
      params?: CommentParams
      ref?: string[]
      force: boolean
      spaces: number
    }
  | undefined

export default (line: string): Comment => {
  const match = line.match(
    /(\s*)<!---\s*([\[])?([^!|\]]+)(!?)(.*)--->/
  )

  if (match) {
    const spaces = match[1].length
    const ref = match[2]
      ? match[3].split(",").map((str) => str.trim())
      : undefined
    const name = match[2] ? undefined : match[3].trim()
    const force = !match[2] && match[4] === "!"
    const rawParams = match[5]

    const params = parseCommentParams(rawParams)

    return { name, force, params, ref, spaces }
  }

  return
}

export function parseCommentParams(rawParams: string) {
  return rawParams.match(/[^|]+/g)?.reduce((memo, str) => {
    const params = parseCommentParam(str)

    if (params) {
      const [name, param] = params
      memo[name] = param
    }

    return memo
  }, {} as CommentParams)
}

export function parseCommentParam(
  rawParam: string
): [string, CommentParam] | undefined {
  const match = rawParam.match(
    /\s?([^\?:]+)(\?)?:\s?([^$]+)/
  )

  if (match) {
    const name = match[1]
    const optional = match[2] === "?"
    const value = match[3].trim()

    return [name, { optional, value }]
  }

  return
}
