export default <T>(str: string) => {
  return import(str) as Promise<T>
}
