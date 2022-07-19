import escapeRegExp from "helpers/escapeRegExp/escapeRegExp"
import { CommentParams } from "helpers/parseComment/parseComment"

export default (
  html: string,
  params: CommentParams | undefined,
  values?: Record<string, any>
): string | undefined => {
  let match = true
  let newHtml = html

  if (params) {
    for (const name in params) {
      const { value } = params[name]

      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(escapeRegExp(value), "g")
        newHtml = newHtml.replace(regex, replaceKey)
      }
    }

    for (const name in params) {
      const { optional } = params[name]

      if (values && values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(
          escapeRegExp(replaceKey),
          "g"
        )

        const oldHtml = newHtml

        if (values && values[name] !== undefined) {
          newHtml = newHtml.replace(
            regex,
            values[name].toString()
          )
        }

        if (
          match === true &&
          !optional &&
          (oldHtml === newHtml || !values || !values[name])
        ) {
          match = false
        }
      }
    }
  }

  return match ? newHtml : undefined
}
