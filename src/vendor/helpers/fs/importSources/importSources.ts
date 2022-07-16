import { toStream } from "typectl"
import importSource from "../importSource/importSource"
import sourceGlob from "../sourceGlob/sourceGlob"

export default <T>({
  baseGlob,
  cwd,
}: {
  baseGlob: string
  cwd?: string
}) => {
  return toStream(
    sourceGlob({ baseGlob, cwd }),
    importSource as (str: any) => Promise<T>
  )
}
