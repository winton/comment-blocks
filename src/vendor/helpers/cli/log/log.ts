function log(...logs: any[]) {
  for (const entry of logs) {
    if (Array.isArray(entry)) {
      log(...entry)
    } else {
      // eslint-disable-next-line no-console
      console.log(
        typeof entry === "string" || entry instanceof Error
          ? entry
          : JSON.stringify(entry, null, 2)
      )
    }
  }
}

export default log
