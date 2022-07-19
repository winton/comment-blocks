import { expect } from "expect"
import describe from "vendor/tests/describe/describe"
import { readFileSync } from "fs"
import { join } from "path"
import projectPath from "vendor/config/projectPath/projectPath"
import { visitCommentModules } from "./visitCommentModules"
import squashComments from "helpers/squashComments/squashComments"

const fixture = readFileSync(
  join(projectPath, "./fixtures/index.html")
).toString()

const lines = squashComments(fixture).split("\n")

describe("visitCommentModules", (it) => {
  it("renders fixture", () => {
    const callbacks: any[] = []
    const stateLog: string[] = []

    const out = visitCommentModules(
      lines,
      ["layout"],
      (result, options) => {
        callbacks.push([
          result,
          { ...options, stateLog: undefined },
        ])
        return result
      },
      { stateLog }
    )

    const log = stateLog.join("\n")

    // console.log(JSON.stringify(callbacks, null, 2))
    // console.log(out)
    // console.log(log)

    // expect(callbacks).toEqual()
    // expect(out).toBe(``.trim() + "\n")
    // expect(log).toBe(``.trim())

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
          params: {
            linkText: {
              optional: false,
              value: "this",
            },
          },
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: true,
              value: "url",
            },
            linkText: {
              optional: false,
              value: "this",
            },
          },
          noContent: true,
        },
      ],
      [
        '      <a href="url">\n        Click here to access\n      </a>',
        {
          absPath: ["layout", "login link", "link"],
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: true,
              value: "url",
            },
          },
          noContent: false,
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          absPath: ["layout", "login link"],
          params: {
            url: {
              optional: true,
              value: "url",
            },
          },
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: true,
              value: "url",
            },
          },
          noContent: false,
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
          params: {
            linkText: {
              optional: false,
              value: "this",
            },
          },
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: false,
              value: "url",
            },
            linkText: {
              optional: false,
              value: "this",
            },
          },
          noContent: true,
        },
      ],
      [
        '      <a href="url">\n        Request a new link.\n      </a>',
        {
          absPath: ["layout", "request link", "link"],
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: false,
              value: "url",
            },
          },
          noContent: false,
        },
      ],
      [
        '    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>',
        {
          absPath: ["layout", "request link"],
          params: {
            url: {
              optional: false,
              value: "url",
            },
          },
          startPath: ["layout"],
          paramsMemo: {
            url: {
              optional: false,
              value: "url",
            },
          },
          noContent: false,
        },
      ],
      [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n  <head>\n    <meta\n      http-equiv="Content-Type"\n      content="text/html; charset=UTF-8"\n    />\n    <title></title>\n    <style></style>\n  </head>\n\n  <body>\n    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>\n\n    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>\n  </body>\n</html>\n',
        {
          absPath: ["layout"],
          startPath: ["layout"],
          paramsMemo: {},
          noContent: false,
        },
      ],
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

    expect(log).toBe(
      `
<!--- layout --->	[ valid path, comment ]
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">	[ valid path, body ]
<html xmlns="http://www.w3.org/1999/xhtml">	[ valid path, body ]
  <head>	[ valid path, body ]
    <meta	[ valid path, body ]
      http-equiv="Content-Type"	[ valid path, body ]
      content="text/html; charset=UTF-8"	[ valid path, body ]
    />	[ valid path, body ]
    <title></title>	[ valid path, body ]
    <style></style>	[ valid path, body ]
  </head>	[ valid path, body ]
	[ valid path, body ]
  <body>	[ valid path, body ]
    <!--- login link | url?: url --->	[ valid path, inner comment ]
    <!--- login link | url?: url --->	[ valid path, comment ]
    <p style="font-size: 18px">	[ valid path, body ]
      🌎&nbsp;	[ valid path, body ]
      <!--- link --->	[ valid path, inner comment ]
      <!--- link --->	[ valid path, comment ]
      <a href="url">	[ valid path, body ]
        <!--- link text | linkText: this --->	[ valid path, inner comment ]
        <!--- link text | linkText: this --->	[ valid path, comment ]
        Click here to access	[ valid path, body ]
      </a>	[ valid path, end ]
      </a>	[ valid path, body ]
    </p>	[ valid path, end ]
    </p>	[ valid path, body ]
	[ valid path, end ]
	[ valid path, body ]
    <!--- request link | url: url --->	[ valid path, inner comment ]
    <!--- request link | url: url --->	[ valid path, comment ]
    <p>	[ valid path, body ]
      This link self destructs after one minute.	[ valid path, body ]
      <!--- link --->	[ valid path, inner comment ]
      <!--- link --->	[ valid path, comment ]
      <a href="url">	[ valid path, body ]
        <!--- link text | linkText: this --->	[ valid path, inner comment ]
        <!--- link text | linkText: this --->	[ valid path, comment ]
        Request a new link.	[ valid path, body ]
      </a>	[ valid path, end ]
      </a>	[ valid path, body ]
    </p>	[ valid path, end ]
    </p>	[ valid path, body ]
  </body>	[ valid path, end ]
  </body>	[ valid path, body ]
</html>	[ valid path, body ]
	[ valid path, body ]
    `.trim()
    )
  })
})
