export default (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
