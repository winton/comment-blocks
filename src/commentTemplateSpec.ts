import { expect } from "expect"
import commentTemplate from "commentTemplate"
import describe from "vendor/tests/describe/describe"
import { readFileSync } from "fs"
import { join } from "path"
import projectPath from "vendor/config/projectPath/projectPath"
import commentTemplateLogToString from "commentTemplateLogToString"

describe("commentTemplate", (it) => {
  it("renders fixture", () => {
    const log: any[] = []
    const out = commentTemplate(
      readFileSync(
        join(projectPath, "./fixtures/index.html")
      ).toString(),
      {
        blocks: {
          layout: {
            blocks: {
              "login link": [
                {
                  params: { url: "" },
                  blocks: { "link text": { string: "" } },
                },
                { string: "" },
              ],
              "request link": {
                blocks: {
                  "link text": [
                    { string: "" },
                    { string: "" },
                  ],
                },
              },
            },
          },
        },
        params: { url: "" },
      },
      { log }
    )

    expect(commentTemplateLogToString(log)).toBe(
      `
base comment set   1   <!--- layout --->
sub comment set    14      <!--- login link | url?: url | test: 1 --->
sub comment clear  22      </p>
base comment set   1       <!--- login link --->
base comment set   1       <!--- login link --->
sub comment set    24      <!--- request link | url: url --->
sub comment clear  32      </p>
base comment set   1       <!--- request link --->
      `.trim()
    )

    expect(out).toBe(
      `
<!--- layout --->
<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\">
  <head>
    <meta
      http-equiv=\"Content-Type\"
      content=\"text/html; charset=UTF-8\"
    />
    <title></title>
    <style></style>
  </head>

  <body>
    <!--- login link --->
    <p style=\"font-size: 18px\">
      🌎&nbsp;
      <a href=\"url\">
        Click here to access
      </a>
    </p>
    <!--- login link --->
    <p style=\"font-size: 18px\">
      🌎&nbsp;
      <a href=\"url\">
        Click here to access
      </a>
    </p>

    <!--- request link --->
    <p>
      This link self destructs after one minute.
      <a href=\"url\">
        Request a new link.
      </a>
    </p>
  </body>
</html>
    `.trim() + "\n"
    )
  })
})
