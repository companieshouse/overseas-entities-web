import { ApplicationData } from "../model";

export const checkRelevantPeriod = (appData: ApplicationData): boolean =>
  appData.update?.change_bo_relevant_period === "CHANGE_BO_RELEVANT_PERIOD" ||
  appData.update?.trustee_involved_relevant_period === "TRUSTEE_INVOLVED_RELEVANT_PERIOD" ||
  appData.update?.change_beneficiary_relevant_period === "CHANGE_BENEFICIARY_RELEVANT_PERIOD";

export const checkRPStatementsExist = (appData: ApplicationData): boolean =>
  appData.update?.change_bo_relevant_period !== undefined ||
  appData.update?.trustee_involved_relevant_period !== undefined ||
  appData.update?.change_beneficiary_relevant_period !== undefined ;
