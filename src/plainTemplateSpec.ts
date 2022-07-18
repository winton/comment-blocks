import { expect } from "expect"
import plainTemplate, {
  CommentTemplateLog,
} from "plainTemplate"
import describe from "vendor/tests/describe/describe"
import { readFileSync } from "fs"
import { join } from "path"
import projectPath from "vendor/config/projectPath/projectPath"
import logToString from "helpers/logToString/logToString"

describe("plainTemplate", (it) => {
  it("renders fixture", () => {
    const log: CommentTemplateLog = []

    const out = plainTemplate(
      readFileSync(
        join(projectPath, "./fixtures/index.html")
      ).toString(),
      {
        blocks: {
          layout: {
            blocks: {
              "login link": [
                {
                  values: { url: "https://2.com" },
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
        values: { url: "https://1.com" },
      },
      { log }
    )

    expect(logToString(log)).toBe(
      `
0  comment found      1   <!--- layout --->
0  base comment set   1   <!--- layout --->
0  comment found      14      <!--- login link | url?: url --->
0  sub comment set    14      <!--- login link | url?: url --->
0  comment found      17        <!--- link --->
0  comment found      19          <!--- link text | linkText: this --->
0  sub comment clear  22      </p>
1  comment found      1       <!--- login link --->
1  base comment set   1       <!--- login link --->
1  comment found      4         <!--- link --->
1  sub comment set    4         <!--- link --->
1  comment found      6           <!--- link text --->
1  sub comment clear  8         </a>
2  comment found      1         <!--- link --->
2  base comment set   1         <!--- link --->
2  comment found      3           <!--- link text --->
2  sub comment set    3           <!--- link text --->
2  sub comment clear  5         </a>
3  comment found      1           <!--- link text --->
3  base comment set   1           <!--- link text --->
1  comment found      1       <!--- login link --->
1  base comment set   1       <!--- login link --->
1  comment found      4         <!--- link --->
1  sub comment set    4         <!--- link --->
1  comment found      6           <!--- link text --->
1  sub comment clear  8         </a>
2  comment found      1         <!--- link --->
2  base comment set   1         <!--- link --->
2  comment found      3           <!--- link text --->
2  sub comment set    3           <!--- link text --->
2  sub comment clear  5         </a>
3  comment found      1           <!--- link text --->
3  base comment set   1           <!--- link text --->
0  comment found      24      <!--- request link | url: url --->
0  sub comment set    24      <!--- request link | url: url --->
0  comment found      27        <!--- link --->
0  comment found      29          <!--- link text | linkText: this --->
0  sub comment clear  32      </p>
1  comment found      1       <!--- request link --->
1  base comment set   1       <!--- request link --->
1  comment found      4         <!--- link --->
1  sub comment set    4         <!--- link --->
1  comment found      6           <!--- link text --->
1  sub comment clear  8         </a>
2  comment found      1         <!--- link --->
2  base comment set   1         <!--- link --->
2  comment found      3           <!--- link text --->
2  sub comment set    3           <!--- link text --->
2  sub comment clear  5         </a>
3  comment found      1           <!--- link text --->
3  base comment set   1           <!--- link text --->
      `.trim()
    )

    expect(out).toBe(
      `
<!--- layout --->
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
    <!--- login link --->
    <p style="font-size: 18px">
      🌎&nbsp;
      <!--- link --->
      <a href="https://2.com">
        <!--- link text --->
        Click here to access
      </a>
    </p>
    <!--- login link --->
    <p style="font-size: 18px">
      🌎&nbsp;
      <!--- link --->
      <a href="https://1.com">
        <!--- link text --->
        Click here to access
      </a>
    </p>

  </body>
</html>
      `.trim() + "\n"
    )
  })
})
