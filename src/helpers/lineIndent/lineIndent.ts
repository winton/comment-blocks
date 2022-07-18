export default (line: string) => {
  const match = line.match(/^\s*/)
  return match ? match[0].length : 0
}
