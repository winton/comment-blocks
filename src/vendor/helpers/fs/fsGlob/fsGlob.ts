import { Readable } from "stream"
import fastGlob from "fast-glob"
import nodeStream from "vendor/helpers/stream/nodeStream/nodeStream"

export default async ({
  absolute,
  cwd,
  globs,
}: {
  absolute?: boolean
  cwd?: string
  globs: string | string[]
}) => {
  absolute ??= true

  const { stream } = await nodeStream<string>(
    fastGlob.stream(globs, {
      absolute,
      cwd,
    }) as Readable
  )

  return stream
}
