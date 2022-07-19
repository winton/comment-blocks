export default (html: string): string => {
  return html.replace(/<!---[\s\S]*?--->/g, (m) => {
    if (m.includes("\n")) {
      const body = m.match(/<!---([\s\S]*?)--->/)

      if (body && body[1]) {
        const [title, ...attrs] = body[1].trim().split(/\n/)

        const params = attrs
          .map((attr) => attr.trim())
          .filter(
            (a) => a.includes(":") && !a.includes("|")
          )

        return `<!--- ${title.trim()} | ${params.join(
          " | "
        )} --->`
      }
    }

    return m
  })
}
