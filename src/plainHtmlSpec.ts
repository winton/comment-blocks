import { expect } from "expect"
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
    const out = plainHtml(["layout"], fixture, [
      {
        values: {
          url: "https://google.com",
          linkText: "hi!",
        },
      },
    ])
    expect(out).toBe(
      `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta
      http-equiv="Content-Type"
      content="text/html; charset=UTF-8"
    />
    <title></title>
    <style></style>
  </head>
  <body>
    <p style="font-size: 18px">
      🌎&nbsp;
      <a href="https://google.com">
hi!
      </a>
    </p>
    <p>
      This link self destructs after one minute.
      <a href="https://google.com">
hi!
      </a>
      Force this.
    </p>
  </body>
</html>
    `.trim()
    )
  })

  it("renders fixture with path", () => {
    const out = plainHtml(
      ["layout", "request link"],
      fixture,
      [
        {
          values: {
            url: "https://google.com",
            linkText: "hi!",
          },
        },
      ]
    )
    expect(out).toBe(
      `    <p>
      This link self destructs after one minute.
      <a href="https://google.com">
hi!
      </a>
      Force this.
    </p>
    `.trimEnd()
    )
  })

  it("renders fixture with path", () => {
    const out = plainHtml(["layout"], fixture, [
      {
        path: ["login link"],
        values: {
          url: "https://google.com",
          linkText: "hi!",
        },
      },
      {
        path: ["login link"],
        values: {
          url: "https://google.com",
          linkText: "hi!",
        },
      },
    ])

    expect(out).toBe(
      `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta
      http-equiv="Content-Type"
      content="text/html; charset=UTF-8"
    />
    <title></title>
    <style></style>
  </head>
  <body>
    <p style="font-size: 18px">
      🌎&nbsp;
      <a href="https://google.com">
hi!
      </a>
    </p>
    <p style="font-size: 18px">
      🌎&nbsp;
      <a href="https://google.com">
hi!
      </a>
    </p>
  </body>
</html>
    `.trim()
    )
  })
})
