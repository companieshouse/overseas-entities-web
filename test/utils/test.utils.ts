export function stringCount(stringToCount: string, inText: string): number {
  const regex = new RegExp(`${stringToCount}`, 'gi');
  const matches = inText.match(regex);
  return matches ? matches.length : 0;
}
