import { expect } from "expect"
import base from "base"
import describe from "vendor/tests/describe/describe"

describe("base", (it) => {
  it("returns true", () => {
    expect(base()).toBe(true)
  })
})
