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
        callbacks.push([result, options])
        return result
      },
      { stateLog }
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
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: {
            url: { optional: true, value: "url" },
            linkText: { optional: false, value: "this" },
          },
        },
      ],
      [
        '      <a href="url">\n        Click here to access\n      </a>',
        {
          absPath: ["layout", "login link", "link"],
          startPath: ["layout"],
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: { url: { optional: true, value: "url" } },
        },
      ],
      [
        '    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>',
        {
          absPath: ["layout", "login link"],
          startPath: ["layout"],
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: { url: { optional: true, value: "url" } },
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
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: {
            url: { optional: false, value: "url" },
            linkText: { optional: false, value: "this" },
          },
        },
      ],
      [
        '      <a href="url">\n        Request a new link.\n      </a>',
        {
          absPath: ["layout", "request link", "link"],
          startPath: ["layout"],
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: {
            url: { optional: false, value: "url" },
          },
        },
      ],
      [
        '    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>',
        {
          absPath: ["layout", "request link"],
          startPath: ["layout"],
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
          params: {
            url: { optional: false, value: "url" },
          },
        },
      ],
      [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n  <head>\n    <meta\n      http-equiv="Content-Type"\n      content="text/html; charset=UTF-8"\n    />\n    <title></title>\n    <style></style>\n  </head>\n\n  <body>\n    <p style="font-size: 18px">\n      🌎&nbsp;\n      <a href="url">\n        Click here to access\n      </a>\n    </p>\n\n    <p>\n      This link self destructs after one minute.\n      <a href="url">\n        Request a new link.\n      </a>\n    </p>\n  </body>\n</html>\n',
        {
          absPath: ["layout"],
          startPath: ["layout"],
          stateLog: [
            "<!--- layout --->\t[ valid path, comment ]",
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\t[ valid path, body ]',
            '<html xmlns="http://www.w3.org/1999/xhtml">\t[ valid path, body ]',
            "  <head>\t[ valid path, body ]",
            "    <meta\t[ valid path, body ]",
            '      http-equiv="Content-Type"\t[ valid path, body ]',
            '      content="text/html; charset=UTF-8"\t[ valid path, body ]',
            "    />\t[ valid path, body ]",
            "    <title></title>\t[ valid path, body ]",
            "    <style></style>\t[ valid path, body ]",
            "  </head>\t[ valid path, body ]",
            "\t[ valid path, body ]",
            "  <body>\t[ valid path, body ]",
            "    <!--- login link | url?: url --->\t[ valid path, inner comment ]",
            "    <!--- login link | url?: url --->\t[ valid path, comment ]",
            '    <p style="font-size: 18px">\t[ valid path, body ]',
            "      🌎&nbsp;\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Click here to access\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "\t[ valid path, end ]",
            "\t[ valid path, body ]",
            "    <!--- request link | url: url --->\t[ valid path, inner comment ]",
            "    <!--- request link | url: url --->\t[ valid path, comment ]",
            "    <p>\t[ valid path, body ]",
            "      This link self destructs after one minute.\t[ valid path, body ]",
            "      <!--- link --->\t[ valid path, inner comment ]",
            "      <!--- link --->\t[ valid path, comment ]",
            '      <a href="url">\t[ valid path, body ]',
            "        <!--- link text | linkText: this --->\t[ valid path, inner comment ]",
            "        <!--- link text | linkText: this --->\t[ valid path, comment ]",
            "        Request a new link.\t[ valid path, body ]",
            "      </a>\t[ valid path, end ]",
            "      </a>\t[ valid path, body ]",
            "    </p>\t[ valid path, end ]",
            "    </p>\t[ valid path, body ]",
            "  </body>\t[ valid path, end ]",
            "  </body>\t[ valid path, body ]",
            "</html>\t[ valid path, body ]",
            "\t[ valid path, body ]",
          ],
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

    expect(stateLog.join("\n")).toBe(
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
