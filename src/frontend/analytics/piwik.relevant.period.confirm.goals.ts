export function isCiDevEnvironment(hostname: string): boolean {
  return hostname.includes("cidev");
}

export type MatomoPaq = {
  push: (args: [string, number]) => void;
};

export function trackRelevantPeriodGoal(
  value: string,
  paq: MatomoPaq | undefined = (window as any).paq
): void {

  if (value === "1") {
    paq.push(["trackGoal", 55]); // User selected YES
  } else if (value === "0") {
    paq.push(["trackGoal", 118]); // User selected NO
  }
}

export function setupRelevantPeriodTracking(): void {
  document.addEventListener("DOMContentLoaded", () => {
    if (!isCiDevEnvironment(window.location.hostname)) {
      return;
    }

    const submitButton = document.getElementById("submit");
    if (!submitButton) {
      return;
    }

    submitButton.addEventListener("click", () => {
      const selected = document.querySelector<HTMLInputElement>(
        'input[name="relevant-period-required-information"]:checked'
      );
      if (!selected) {
        return;
      }

      trackRelevantPeriodGoal(selected.value);
    });
  });
}
