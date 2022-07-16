import ReadableStreamPolyfill from "../ReadableStreamPolyfill/ReadableStreamPolyfill"

export default async <T>() => {
  const output: {
    stream?: ReadableStream<T>
    controller?: ReadableStreamController<T>
  } = {}

  output.stream = new ReadableStreamPolyfill<T>({
    start(controller) {
      output.controller = controller
    },
  })

  return output as Required<typeof output>
}
