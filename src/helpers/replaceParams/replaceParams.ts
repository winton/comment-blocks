import escapeRegExp from "helpers/escapeRegExp/escapeRegExp"
import { CommentParams } from "helpers/parseComment/parseComment"

export default (
  html: string,
  params: CommentParams | undefined,
  values?: Record<string, any>
): string => {
  let newHtml = html

  if (params) {
    for (const name in params) {
      const { optional, value } = params[name]

      if (values) {
        if (values[name] && value === "this") {
          newHtml = values[name]
        }

        if (values[name] === undefined && optional) {
          values[name] = value
        }
      }
    }

    for (const name in params) {
      const { value } = params[name]

      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(escapeRegExp(value), "g")
        newHtml = newHtml.replace(regex, replaceKey)
      }
    }

    for (const name in params) {
      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(
          escapeRegExp(replaceKey),
          "g"
        )

        if (values && values[name] !== undefined) {
          newHtml = newHtml.replace(
            regex,
            values[name].toString()
          )
        }
      }
    }
  }

  return newHtml
}
