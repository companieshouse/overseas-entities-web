import {
  isCiDevEnvironment,
  trackRelevantPeriodGoal,
  MatomoPaq,
} from "../../../src/frontend/analytics/piwik.relevant.period.confirm.goals.ts";

describe("isCiDevEnvironment", () => {
  it("returns true when hostname includes 'cidev'", () => {
    expect(isCiDevEnvironment("dev.cidev.internal")).toBe(true);
  });

  it("returns false when hostname does not include 'cidev'", () => {
    expect(isCiDevEnvironment("example.gov.uk")).toBe(false);
  });
});

describe("trackRelevantPeriodGoal", () => {
  let mockPaq: MatomoPaq;

  beforeEach(() => {
    mockPaq = { push: jest.fn() };
  });

  it("tracks goal 55 for value '1'", () => {
    trackRelevantPeriodGoal("1", mockPaq);
    expect(mockPaq.push).toHaveBeenCalledWith(["trackGoal", 55]);
  });

  it("tracks goal 118 for value '0'", () => {
    trackRelevantPeriodGoal("0", mockPaq);
    expect(mockPaq.push).toHaveBeenCalledWith(["trackGoal", 118]);
  });
});
