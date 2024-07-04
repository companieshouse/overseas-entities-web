export const BeneficialOwnerTypeKey = "beneficial_owner_type";

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
