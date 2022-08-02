import escapeRegExp from "helpers/escapeRegExp/escapeRegExp"

export default (
  str: string,
  params: Record<string, string>,
  values: Record<string, string>
): string => {
  let newStr = str

  if (params) {
    for (const name in params) {
      const value = params[name]

      if (values[name] && value === "this") {
        newStr = values[name]
      }
    }

    for (const name in params) {
      const value = params[name]

      if (values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(escapeRegExp(value), "g")
        newStr = newStr.replace(regex, replaceKey)
      }
    }

    for (const name in params) {
      if (values[name] !== undefined) {
        const replaceKey = `$!-!-${name}-!-!$`
        const regex = new RegExp(
          escapeRegExp(replaceKey),
          "g"
        )

        if (values[name] !== undefined) {
          newStr = newStr.replace(
            regex,
            values[name].toString()
          )
        }
      }
    }
  }

  return newStr
}
