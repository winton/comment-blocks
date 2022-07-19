export default (a1?: any[], a2?: any[]) =>
  a1 !== undefined &&
  a2 !== undefined &&
  a1.length === a2.length &&
  a1.every((value, index) => value === a2[index])
