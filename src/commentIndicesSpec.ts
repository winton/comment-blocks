import { expect } from "expect"
import commentIndices from "commentIndices"
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
body1.2
<!-- mod: mod4 -->
body4
`

describe("commentIndices", (it) => {
  it("renders", () => {
    const indices = commentIndices(html)
    expect(indices).toEqual([
      {
        commentBody: "mod1",
        indent: 0,
        startCommentIndex: 1,
        startBodyIndex: 20,
        endIndex: 119,
      },
      {
        commentBody: "mod2",
        indent: 2,
        startCommentIndex: 28,
        startBodyIndex: 49,
        endIndex: 111,
      },
      {
        commentBody: "mod3",
        indent: 4,
        startCommentIndex: 59,
        startBodyIndex: 95,
        endIndex: 101,
      },
      {
        commentBody: "mod4",
        indent: 0,
        startCommentIndex: 119,
        startBodyIndex: 138,
        endIndex: 144,
      },
    ])
  })
})
