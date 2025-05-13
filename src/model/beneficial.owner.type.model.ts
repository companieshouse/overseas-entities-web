export const BeneficialOwnerTypeKey = "beneficial_owner_type";
export const BeneficialOwnerTypeRPKey = "beneficial_owner_type_relevant_period";

export enum BeneficialOwnerTypeChoice {
    individual = "individualOwner",
    otherLegal = "otherLegalOwner",
    government = "governmentOrPublicOwner",
    relevantPeriodIndividual = "relevantPeriodIndividualOwner",
    relevantPeriodOtherLegal = "relevantPeriodOtherLegalOwner",
    relevantPeriodGovernment = "relevantPeriodGovernment"
}

export enum ManagingOfficerTypeChoice {
    individual = "individualOfficer",
    corporate = "corporateOfficer"
}
