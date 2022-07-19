// import { expect } from "expect"
import describe from "vendor/tests/describe/describe"
import { readFileSync } from "fs"
import { join } from "path"
import projectPath from "vendor/config/projectPath/projectPath"
import plainHtml from "plainHtml"

const fixture = readFileSync(
  join(projectPath, "./fixtures/index.html")
).toString()

describe("plainHtml", (it) => {
  it("renders fixture", () => {
    plainHtml(fixture, [
      {
        path: ["layout"],
        values: { url: "https://google.com" },
      },
    ])
    // console.log(out)
  })
})
