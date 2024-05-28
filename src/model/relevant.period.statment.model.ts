
export const RelevantPeriodStatementsKey = "combined_statements_page";
export const RelevantPeriodStatementOneKey = "CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER";
export const RelevantPeriodStatementTwoKey = "TRUST_INVOLVED_IN_THE_OE";
export const RelevantPeriodStatementThreeKey = "BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST";

export enum RelevantPeriodStatementOne {
  YES = "CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER",
  NO = "NO_CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER"
}

export enum RelevantPeriodStatementTwo {
  YES = "TRUST_INVOLVED_IN_THE_OE",
  NO = "NO_TRUST_INVOLVED_IN_THE_OE"
}

export enum RelevantPeriodStatementThree {
  YES = "BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST",
  NO = "NO_BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST"
}
