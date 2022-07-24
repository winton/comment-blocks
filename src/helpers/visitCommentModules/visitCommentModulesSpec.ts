import { expect } from "expect"
import { readFileSync } from "fs"
import { join } from "path"
import describe from "vendor/tests/describe/describe"
import projectPath from "vendor/config/projectPath/projectPath"
import squashComments from "helpers/squashComments/squashComments"
import { visitCommentModules } from "./visitCommentModules"

const fixture = readFileSync(
  join(projectPath, "./fixtures/index.html")
).toString()

describe("visitCommentModules", (it) => {
  it("visits fixture", () => {
    const lines = squashComments(fixture).split("\n")
    const callbacks: any[] = []
    const stateLog: string[] = []

    const out = visitCommentModules(
      lines,
      ["layout"],
      (result, lines, options) => {
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
    // expect(out).toBe(``.trim())
    // expect(log).toBe(``.trim())

    expect(callbacks).toEqual([
      [
        "        Click here to access",
        {
          params: {
            linkText: {
              optional: false,
              value: "this",
            },
          },
          absPath: [
            "layout",
            "login link",
            "link",
            "link text",
          ],
          force: false,
          noChildContent: true,
        },
      ],
      [
        '      <a href="url">\n        Click here to access\n      </a>',
        {
          absPath: ["layout", "login link", "link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          params: {
            url: {
              optional: true,
              value: "url",
            },
          },
          absPath: ["layout", "login link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        "        Request a new link.",
        {
          params: {
            linkText: {
              optional: false,
              value: "this",
            },
          },
          absPath: [
            "layout",
            "request link",
            "link",
            "link text",
          ],
          force: false,
          noChildContent: true,
        },
      ],
      [
        '      <a href="url">\n        Request a new link.\n      </a>',
        {
          absPath: ["layout", "request link", "link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        "      Force this.",
        {
          params: {
            someVar: {
              optional: false,
              value: "blah",
            },
          },
          absPath: ["layout", "request link", "force"],
          force: true,
          noChildContent: true,
        },
      ],
      [
        '    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n      Force this.\n    </p>',
        {
          params: {
            url: {
              optional: false,
              value: "url",
            },
          },
          absPath: ["layout", "request link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n  <head>\n    <meta\n      http-equiv="Content-Type"\n      content="text/html; charset=UTF-8"\n    />\n    <title></title>\n    <style></style>\n  </head>\n  <body>\n    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>\n    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n      Force this.\n    </p>\n  </body>\n</html>',
        {
          absPath: ["layout"],
          force: false,
          noChildContent: false,
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
      Force this.
    </p>
  </body>
</html>
    `.trim()
    )

    expect(log).toBe(
      `
<!--- layout --->	[ comment ]
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
    <!--- request link | url: url --->	[ valid path, end ]
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
      <!--- force! | someVar: blah --->	[ valid path, end ]
      <!--- force! | someVar: blah --->	[ valid path, inner comment ]
      <!--- force! | someVar: blah --->	[ valid path, comment ]
      Force this.	[ valid path, body ]
    </p>	[ valid path, end ]
    </p>	[ valid path, body ]
  </body>	[ valid path, end ]
  </body>	[ valid path, body ]
</html>	[ valid path, body ]
    `.trim()
    )
  })

  it("visits fixture with path", () => {
    const lines = squashComments(fixture).split("\n")
    const callbacks: any[] = []
    const stateLog: string[] = []

    const out = visitCommentModules(
      lines,
      ["layout", "login link"],
      (result, lines, options) => {
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
    // expect(out).toBe(``.trimEnd())
    // expect(log).toBe(``.trim())

    expect(callbacks).toEqual([
      [
        "        Click here to access",
        {
          params: {
            linkText: {
              optional: false,
              value: "this",
            },
          },
          absPath: [
            "layout",
            "login link",
            "link",
            "link text",
          ],
          force: false,
          noChildContent: true,
        },
      ],
      [
        '      <a href="url">\n        Click here to access\n      </a>',
        {
          absPath: ["layout", "login link", "link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          params: {
            url: {
              optional: true,
              value: "url",
            },
          },
          absPath: ["layout", "login link"],
          force: false,
          noChildContent: false,
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          absPath: ["layout"],
          force: false,
          noChildContent: false,
        },
      ],
    ])

    expect(out).toBe(
      `    <p style="font-size: 18px">
      🌎&nbsp;
      <a href="url">
        Click here to access
      </a>
    </p>
    `.trimEnd()
    )

    expect(log).toBe(
      `
<!--- layout --->	[ comment ]
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">	[ body ]
<html xmlns="http://www.w3.org/1999/xhtml">	[ body ]
  <head>	[ body ]
    <meta	[ body ]
      http-equiv="Content-Type"	[ body ]
      content="text/html; charset=UTF-8"	[ body ]
    />	[ body ]
    <title></title>	[ body ]
    <style></style>	[ body ]
  </head>	[ body ]
  <body>	[ body ]
    <!--- login link | url?: url --->	[ inner comment ]
    <!--- login link | url?: url --->	[ comment ]
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
    <!--- request link | url: url --->	[ valid path, end ]
    <!--- request link | url: url --->	[ inner comment ]
    <!--- request link | url: url --->	[ comment ]
    <p>	[ body ]
      This link self destructs after one minute.	[ body ]
      <!--- link --->	[ inner comment ]
      <!--- link --->	[ comment ]
      <a href="url">	[ body ]
        <!--- link text | linkText: this --->	[ inner comment ]
        <!--- link text | linkText: this --->	[ comment ]
        Request a new link.	[ body ]
      </a>	[ end ]
      </a>	[ body ]
      <!--- force! | someVar: blah --->	[ end ]
      <!--- force! | someVar: blah --->	[ inner comment ]
      <!--- force! | someVar: blah --->	[ comment ]
      Force this.	[ body ]
    </p>	[ end ]
    </p>	[ body ]
  </body>	[ end ]
  </body>	[ body ]
</html>	[ body ]
    `.trim()
    )
  })
})
