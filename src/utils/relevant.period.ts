import { ApplicationData } from "../model";

export const checkRelevantPeriod = (appData: ApplicationData): boolean =>
  appData.update?.change_bo_relevant_period === "CHANGE_BO_RELEVANT_PERIOD" ||
  appData.update?.trustee_involved_relevant_period === "TRUSTEE_INVOLVED_RELEVANT_PERIOD" ||
  appData.update?.change_beneficiary_relevant_period === "CHANGE_BENEFICIARY_RELEVANT_PERIOD";

export const checkRPStatementsExist = (appData: ApplicationData): boolean =>
  (!!appData.update?.change_bo_relevant_period && appData.update?.change_bo_relevant_period !== "NO_CHANGE_BO_RELEVANT_PERIOD") ||
  (!!appData.update?.trustee_involved_relevant_period && appData.update?.trustee_involved_relevant_period !== "NO_TRUSTEE_INVOLVED_RELEVANT_PERIOD") ||
  (!!appData.update?.change_beneficiary_relevant_period && appData.update?.change_beneficiary_relevant_period !== "NO_CHANGE_BENEFICIARY_RELEVANT_PERIOD");

export const checkAnyRPStatementsActionWasTaken = (appData: ApplicationData): boolean =>
  appData.update?.change_bo_relevant_period === "CHANGE_BO_RELEVANT_PERIOD" ||
  appData.update?.change_bo_relevant_period === "NO_CHANGE_BO_RELEVANT_PERIOD" ||
  appData.update?.trustee_involved_relevant_period === "TRUSTEE_INVOLVED_RELEVANT_PERIOD" ||
  appData.update?.trustee_involved_relevant_period === "NO_TRUSTEE_INVOLVED_RELEVANT_PERIOD" ||
  appData.update?.change_beneficiary_relevant_period === "CHANGE_BENEFICIARY_RELEVANT_PERIOD" ||
  appData.update?.change_beneficiary_relevant_period === "NO_CHANGE_BENEFICIARY_RELEVANT_PERIOD";

export const relevantPeriodPscStatements: Set<string> = new Set([
  "change-beneficial-owner-relevant-period",
  "no-change-beneficial-owner-relevant-period",
  "trust-involved-relevant-period",
  "no-trust-involved-relevant-period",
  "change-beneficiary-relevant-period",
  "no-change-beneficiary-relevant-period"
]);
