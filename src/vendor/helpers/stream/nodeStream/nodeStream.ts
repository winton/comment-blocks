import { Readable } from "stream"
import readableStream from "../readableStream/readableStream"

export default async <T>(nodeStream: Readable) => {
  const { stream, controller } = await readableStream<T>()

  ;(async () => {
    for await (const path of nodeStream) {
      controller.enqueue(path)
    }

    controller.close()
  })()

  return { stream, controller }
}
