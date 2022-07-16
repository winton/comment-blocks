import { lstat } from "fs/promises"

export default async (path: string): Promise<boolean> => {
  try {
    return (await lstat(path)).isFile()
  } catch (e) {
    return false
  }
}
