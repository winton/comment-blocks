// import { expect } from "expect"
import describe from "vendor/tests/describe/describe"
import { readFileSync } from "fs"
import { join } from "path"
import projectPath from "vendor/config/projectPath/projectPath"
import { visitCommentModules } from "./visitCommentModules"
import squashComments from "helpers/squashComments/squashComments"

describe("plainHtml", (it) => {
  it("renders fixture", () => {
    const fixture = readFileSync(
      join(projectPath, "./fixtures/index.html")
    ).toString()

    const lines = squashComments(fixture).split("\n")

    visitCommentModules(
      lines,
      ["layout"],
      (path, result) => result
    )
  })
})
