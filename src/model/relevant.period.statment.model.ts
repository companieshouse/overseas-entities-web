
export const RelevantPeriodStatementsKey = "combined_statements_page";
export const RelevantPeriodStatementOne = "CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER";
export const RelevantPeriodStatementTwo = "TRUST_INVOLVED_IN_THE_OE";
export const RelevantPeriodStatementThree = "BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST";

export enum RelevantPeriodStatementsType {
  CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER = "ceased_to_be_registrable_beneficial_owner",
  NO_CEASED_TO_BE_REGISTRABLE_BENEFICIAL_OWNER = "no_ceased_to_be_registrable_beneficial_owner",
  TRUST_INVOLVED_IN_THE_OE = "trust_involved_in_the_oe",
  NO_TRUST_INVOLVED_IN_THE_OE = "no_trust_involved_in_the_oe",
  BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST = "become_or_ceased_beneficiary_of_a_trust",
  NO_BECOME_OR_CEASED_BENEFICIARY_OF_A_TRUST = "no_become_or_ceased_beneficiary_of_a_trust"
}
