import { expect } from "expect"
import fsGlob from "./fsGlob"
import { toArray } from "typectl"
import srcPath from "../../../config/srcPath/srcPath"
import describe from "vendor/tests/describe/describe"

describe("fsGlob", (it) => {
  it("matches a path", async () => {
    expect(
      await toArray(
        fsGlob({
          absolute: false,
          globs: "**/fsGlob.ts",
          cwd: srcPath,
        })
      )
    ).toContain("vendor/helpers/fs/fsGlob/fsGlob.ts")
  })
})
