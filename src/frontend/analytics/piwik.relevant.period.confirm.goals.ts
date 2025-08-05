/* eslint-disable no-underscore-dangle */
export function isCiDevEnvironment(hostname: string): boolean {
  return hostname.includes("cidev");
}

export type MatomoPaq = {
  push: (args: [string, number]) => void;
};

export function trackRelevantPeriodGoal(
  value: string,
  paq: MatomoPaq | undefined = (window as any)._paq
): void {

  if (value === "1") {
    paq.push(["trackGoal", 55]); // User selected YES
  } else if (value === "0") {
    paq.push(["trackGoal", 118]); // User selected NO
  }
}
