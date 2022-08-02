import { expect } from "expect"
import describe from "vendor/tests/describe/describe"
import {
  commentIterator,
  commentIndices,
} from "commentBlocks"

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
  <!-- ref: mod3 -->
body1.2
<!-- mod: mod4, key4: val -->
body4
`

describe("commentIterator", (it) => {
  it("matches all", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices)

    // console.warn(JSON.stringify(output))
    // console.warn(output)

    expect(output).toBe(
      "body1\n  body2\n    body3\n  body2.2\n    body3\nbody1.2\nbody4"
    )
  })

  it("no matches", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: { match: () => undefined },
    })

    // console.warn(JSON.stringify(output))

    expect(output).toBe(undefined)
  })

  it("one match", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: {
        match: ({ moduleName }) =>
          moduleName === "mod2"
            ? [{ show: true }]
            : undefined,
      },
    })

    // console.warn(JSON.stringify(output))

    expect(output).toBe("body2\n  body2.2")
  })

  it("one match with cascading show", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: {
        match: ({ moduleName }, { show }) =>
          moduleName === "mod2"
            ? [{ show: true }]
            : show
            ? [{ show: true }]
            : undefined,
      },
    })

    // console.warn(JSON.stringify(output))

    expect(output).toBe("body2\n    body3\n  body2.2")
  })

  it("two root matches", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: {
        match: ({ moduleName }) =>
          moduleName === "mod1" || moduleName === "mod4"
            ? [{ show: true }]
            : undefined,
      },
    })

    // console.warn(JSON.stringify(output))

    expect(output).toBe("body1\nbody1.2\nbody4")
  })

  it("two root matches with cascading show", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: {
        match: ({ moduleName }, { show }) =>
          moduleName === "mod1" || moduleName === "mod4"
            ? [{ show: true }]
            : show
            ? [{ show: true }]
            : undefined,
      },
    })

    // console.warn(JSON.stringify(output))
    // console.warn(output)

    expect(output).toBe(
      "body1\n  body2\n    body3\n  body2.2\n    body3\nbody1.2\nbody4"
    )
  })

  it("multiple matches, same module", () => {
    const indices = commentIndices(html)
    const output = commentIterator(html, indices, {
      callbacks: {
        match: ({ moduleName }) =>
          moduleName === "mod2" || moduleName === "mod3"
            ? [{ show: true }, { show: true }]
            : undefined,
      },
    })

    // console.warn(JSON.stringify(output))
    // console.warn(output)

    expect(output).toBe(
      "body2\n    body3\n    body3\n  body2.2\n  body2\n    body3\n    body3\n  body2.2\n    body3\n    body3\n    body3\n    body3"
    )
  })
})
