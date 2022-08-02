import { expect } from "expect"
import commentIndices from "commentIndices"
import describe from "vendor/tests/describe/describe"
import replaceComment from "replaceComment"

const html = `
<html>
  <!-- mod: replace -->
  replace
  me
</html>
`

const result = `
<html>
  hi
</html>`

describe("replaceComment", (it) => {
  it("replaces", () => {
    const indices = commentIndices(html)
    expect(
      replaceComment(html, "hi\n", indices[0])
    ).toEqual([result, 34])
  })
})
