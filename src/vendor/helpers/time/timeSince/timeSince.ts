export default (start: number) => {
  const diff = new Date().getTime() - start
  return diff < 1000
    ? `${diff}ms`
    : diff < 60000
    ? `${(diff / 1000).toFixed(3)}sec`
    : `${(diff / (1000 * 60)).toFixed(2)}min`
}
