import { expect } from "expect"
import { commentIndices } from "commentBlocks"
import describe from "vendor/tests/describe/describe"

const html = `
<!-- mod: mod1 -->
body1
  <!-- mod: mod2 -->
  body2
    <!--
      mod: mod3
    -->   
    body3
  body2.2
  <!-- ref: mod3 -->
body1.2
<!-- mod: mod4 -->
body4
`

describe("commentIndices", (it) => {
  it("builds indices", () => {
    const indices = commentIndices(html)
    // console.warn(JSON.stringify(indices))
    expect(indices).toEqual([
      {
        moduleName: "mod1",
        params: {},
        indent: 0,
        startCommentIndex: 1,
        startBodyIndex: 20,
        endIndex: 140,
        trigger: "mod",
      },
      {
        moduleName: "mod2",
        params: {},
        indent: 2,
        startCommentIndex: 28,
        startBodyIndex: 49,
        endIndex: 111,
        trigger: "mod",
      },
      {
        moduleName: "mod3",
        params: {},
        indent: 4,
        startCommentIndex: 59,
        startBodyIndex: 95,
        endIndex: 101,
        trigger: "mod",
      },
      {
        moduleName: "mod3",
        params: {},
        indent: 2,
        startCommentIndex: 113,
        startBodyIndex: 132,
        endIndex: 132,
        trigger: "ref",
      },
      {
        moduleName: "mod4",
        params: {},
        indent: 0,
        startCommentIndex: 140,
        startBodyIndex: 159,
        endIndex: 165,
        trigger: "mod",
      },
    ])
  })
})
