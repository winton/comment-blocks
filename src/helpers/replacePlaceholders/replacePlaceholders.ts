import { CommentTemplateParam } from "plainHtml"
import escapeRegExp from "helpers/escapeRegExp/escapeRegExp"

export default (
  html: string,
  placeholders: CommentTemplateParam[] | undefined,
  values: Record<string, any> | undefined
): [string, boolean] => {
  let match = true
  let newHtml = html

  if (placeholders) {
    for (const param of placeholders) {
      const { key, value } = param

      if (values && values[key] !== undefined) {
        const replaceKey = `$!-!-${key}-!-!$`
        const regex = new RegExp(escapeRegExp(value), "g")
        newHtml = newHtml.replace(regex, replaceKey)
      }
    }

    for (const param of placeholders) {
      const { key, optional } = param

      if (values && values[key] !== undefined) {
        const replaceKey = `$!-!-${key}-!-!$`
        const regex = new RegExp(
          escapeRegExp(replaceKey),
          "g"
        )

        const oldHtml = newHtml

        if (values && values[key] !== undefined) {
          newHtml = newHtml.replace(
            regex,
            values[key].toString()
          )
        }

        if (
          match === true &&
          !optional &&
          (oldHtml === newHtml || !values || !values[key])
        ) {
          match = false
        }
      }
    }
  }

  return [newHtml, match]
}
