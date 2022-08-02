import { expect } from "expect"
import commentIndices from "commentIndices"
import describe from "vendor/tests/describe/describe"
import commentIterator from "commentIterator"

const html = `
<!-- mod: mod1, key1: val -->
body1
  <!-- mod: mod2, key2: val -->
  body2
    <!--
      mod: mod3
      key3: val
    -->   
    body3
  body2.2
body1.2
<!-- mod: mod4, key4: val -->
body4
`

describe("commentIterator", (it) => {
  it("matches all", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName, params, options) => [
        {
          parentMatch: true,
          params: { ...options.params, ...params },
          values: options.values,
        },
      ]
    )

    console.warn(output)

    expect(output).toBe(
      "body1\n  \n  body2\n    \n    body3\n\n  body2.2\nbody1.2\n\nbody4"
    )
  })

  it("no matches", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName, params, options) => undefined
    )

    console.warn(output)

    expect(output).toBe("")
  })
})
