import { expect } from "expect"
import importSources from "./importSources"
import describe from "vendor/tests/describe/describe"

describe("importSources", (it) => {
  it("streams tasks", async () => {
    const stream = await importSources<{
      default: typeof importSources
    }>({
      baseGlob: "importSources*",
    })

    const reader = stream.getReader()
    const result = await reader.read()

    expect(result.value?.default).toBe(importSources)
  })
})
