import serverBuildPath from "vendor/config/serverBuildPath/serverBuildPath"
import fsGlob from "vendor/helpers/fs/fsGlob/fsGlob"

export default async ({
  absolute,
  baseGlob,
  cwd,
}: {
  absolute?: boolean
  cwd?: string
  baseGlob: string
}) => {
  cwd ||= serverBuildPath
  return fsGlob({
    absolute,
    cwd,
    globs: [`*/${baseGlob}.js`, `**/${baseGlob}.js`],
  })
}
