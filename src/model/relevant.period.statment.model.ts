
export const RelevantPeriodStatementsKey = "combined_statements_page";
export const RelevantPeriodStatementOneKey = "change_bo_relevant_period";
export const RelevantPeriodStatementTwoKey = "trustee_involved_relevant_period";
export const RelevantPeriodStatementThreeKey = "change_beneficiary_relevant_period";

export enum RelevantPeriodStatementOne {
  YES = "CHANGE_BO_RELEVANT_PERIOD",
  NO = "NO_CHANGE_BO_RELEVANT_PERIOD"
}

export enum RelevantPeriodStatementTwo {
  YES = "TRUSTEE_INVOLVED_RELEVANT_PERIOD",
  NO = "NO_TRUSTEE_INVOLVED_RELEVANT_PERIOD"
}

export enum RelevantPeriodStatementThree {
  YES = "CHANGE_BENEFICIARY_RELEVANT_PERIOD",
  NO = "NO_CHANGE_BENEFICIARY_RELEVANT_PERIOD"
}
