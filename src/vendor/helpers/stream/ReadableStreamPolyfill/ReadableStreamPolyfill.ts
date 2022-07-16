export default (typeof ReadableStream === "undefined"
  ? (await import("web-streams-polyfill")).ReadableStream
  : ReadableStream) as typeof ReadableStream
