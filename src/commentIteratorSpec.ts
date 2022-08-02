import { expect } from "expect"
import commentIndices from "commentIndices"
import describe from "vendor/tests/describe/describe"
import commentIterator from "commentIterator"

const html = `
asd
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
    const output = commentIterator(html, indices, () => [
      { force: true },
    ])

    // console.warn(JSON.stringify(output))

    expect(output).toBe(
      "body1\n  \n  body2\n    \n    body3\n\n  body2.2\nbody1.2\nbody4"
    )
  })

  it("no matches", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      () => undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe("")
  })

  it("one match", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName) =>
        moduleName === "mod2"
          ? [{ force: true }]
          : undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe("body2\n    \n  body2.2")
  })

  it("one match with cascading force", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName, params, options) =>
        moduleName === "mod2"
          ? [{ force: true }]
          : options.force
          ? [{ force: true }]
          : undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe(
      "body2\n    \n    body3\n\n  body2.2"
    )
  })

  it("two root matches", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName) =>
        moduleName === "mod1" || moduleName === "mod4"
          ? [{ force: true }]
          : undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe("body1\n  \nbody1.2\nbody4")
  })

  it("two root matches with cascading force", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName, params, options) =>
        moduleName === "mod1" || moduleName === "mod4"
          ? [{ force: true }]
          : options.force
          ? [{ force: true }]
          : undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe(
      "body1\n  \n  body2\n    \n    body3\n\n  body2.2\nbody1.2\nbody4"
    )
  })

  it("multiple matches, same module", () => {
    const indices = commentIndices(html)
    const output = commentIterator(
      html,
      indices,
      (moduleName, params, options) =>
        moduleName === "mod2" || moduleName === "mod3"
          ? [{ force: true }, { force: true }]
          : undefined
    )

    // console.warn(JSON.stringify(output))

    expect(output).toBe(
      "body2\n    \n    body3\n\n    body3\n\n  body2.2\n  body2\n    \n    body3\n\n    body3\n\n  body2.2"
    )
  })
})
