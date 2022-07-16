import exitHook from "exit-hook"
import cliArgs from "vendor/helpers/cli/cliArgs/cliArgs"
import importSources from "vendor/helpers/fs/importSources/importSources"
import timeSince from "vendor/helpers/time/timeSince/timeSince"

export default async () => {
  const grep = cliArgs.g || cliArgs.grep
  const start = new Date().getTime()

  await importSources({
    baseGlob: `${grep || "[a-z]*"}Spec`,
  })

  exitHook(() =>
    // eslint-disable-next-line no-console
    console.log(`\n🐢 ${timeSince(start)}`)
  )
}
