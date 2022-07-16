import log from "vendor/helpers/cli/log/log"
import timeSince from "vendor/helpers/time/timeSince/timeSince"

export default function describe(
  desc: string,
  fn: (
    it: (
      desc: string,
      fn: (log: (any: any) => void) => void | Promise<void>
    ) => void
  ) => void
) {
  const promises: any[] = []
  const logs: any[] = []

  const it = (
    desc: string,
    fn: (log: (any: any) => void) => void | Promise<void>
  ) => {
    const logs2: any[] = [desc]
    const pushLog = (any: any) => logs2.push(any)
    const start = new Date().getTime()

    const promise = Promise.resolve(fn(pushLog))
      .then(() => {
        logs2[0] = `✔️  ${logs2[0]} (${timeSince(start)})`
      })
      .catch((e) => {
        logs2.push(e)
        logs2[0] = `🛑 ${logs2[0]}`
        logs.push(logs2)
        log(...logs)
        process.exit(1)
      })

    promises.push(promise.then(() => logs.push(logs2)))
  }

  fn(it)

  return Promise.all(promises).then(() => {
    // eslint-disable-next-line no-console
    console.log(`\n${desc}`)
    log(...logs)
  })
}
