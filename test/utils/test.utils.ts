export function wordCount(wordToCount: string, inText: string): number {
  const regex = new RegExp(`${wordToCount}`, 'gm');
  const matches = inText.match(regex);
  const wordCount = matches ? matches.length : 0;
  return wordCount;
}
