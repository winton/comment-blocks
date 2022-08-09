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
  <!--
    mod: mod3Ref
    ref: mod3
  -->

  <!--
    mod: mod3Ref
    ref: mod3
  -->
body1.2
<!-- mod: mod4 -->
body4
`

describe("commentIndices", (it) => {
  it("builds indices", () => {
    const indices = commentIndices(html)
    console.warn(JSON.stringify(indices))
    expect(indices).toEqual([
      {
        moduleName: "mod1",
        params: {},
        indent: 0,
        startCommentIndex: 1,
        startBodyIndex: 20,
        endIndex: 208,
      },
      {
        moduleName: "mod2",
        params: {},
        indent: 2,
        startCommentIndex: 28,
        startBodyIndex: 49,
        endIndex: 111,
      },
      {
        moduleName: "mod3",
        params: {},
        indent: 4,
        startCommentIndex: 59,
        startBodyIndex: 95,
        endIndex: 101,
      },
      {
        moduleName: "mod3Ref",
        params: {},
        refParam: "mod3",
        indent: 2,
        startCommentIndex: 113,
        startBodyIndex: 155,
        endIndex: 155,
      },
      {
        moduleName: "mod3Ref",
        params: {},
        refParam: "mod3",
        indent: 2,
        startCommentIndex: 158,
        startBodyIndex: 200,
        endIndex: 200,
      },
      {
        moduleName: "mod4",
        params: {},
        indent: 0,
        startCommentIndex: 208,
        startBodyIndex: 227,
        endIndex: 233,
      },
    ])
  })
})
