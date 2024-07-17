/* eslint-disable @typescript-eslint/no-explicit-any */
export default function snakeToCamelCase(obj: any): any {
  const newObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelCaseKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
    newObj[camelCaseKey] = typeof value === 'object' && value !== null ? snakeToCamelCase(value) : value;
  }
  return newObj;
}
