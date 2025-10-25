export const deepCloneObject = typeof structuredClone === "function"
  ? structuredClone
  : (obj: any) => JSON.parse(JSON.stringify(obj));
