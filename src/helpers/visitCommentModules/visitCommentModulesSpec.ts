import { expect } from "expect"
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

    const callbacks: any[] = []

    const out = visitCommentModules(
      lines,
      ["layout"],
      (result, options) => {
        callbacks.push([result, options])
        return result
      }
    )

    expect(callbacks).toEqual([
      [
        "        Click here to access",
        {
          absPath: [
            "layout",
            "login link",
            "link",
            "link text",
          ],
          startPath: ["layout"],
        },
      ],
      [
        '      <a href="url">\n        Click here to access\n      </a>',
        {
          absPath: ["layout", "login link", "link"],
          startPath: ["layout"],
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          absPath: ["layout", "login link"],
          startPath: ["layout"],
        },
      ],
      [
        "        Request a new link.",
        {
          absPath: [
            "layout",
            "request link",
            "link",
            "link text",
          ],
          startPath: ["layout"],
        },
      ],
      [
        '      <a href="url">\n        Request a new link.\n      </a>',
        {
          absPath: ["layout", "request link", "link"],
          startPath: ["layout"],
        },
      ],
      [
        '    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>',
        {
          absPath: ["layout", "request link"],
          startPath: ["layout"],
        },
      ],
      [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n  <head>\n    <meta\n      http-equiv="Content-Type"\n      content="text/html; charset=UTF-8"\n    />\n    <title></title>\n    <style></style>\n  </head>\n\n  <body>\n    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>\n\n    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>\n  </body>\n</html>\n',
        {
          absPath: ["layout"],
          startPath: ["layout"],
        },
      ],
    ])

    expect(out).toEqual(
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
      <a href="url">
        Click here to access
      </a>
    </p>

    <p>
      This link self destructs after one minute.
      <a href="url">
        Request a new link.
      </a>
    </p>
  </body>
</html>
    `.trim() + "\n"
    )
  })
})
