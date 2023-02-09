export const BeneficialOwnerTypeKey = "beneficial_owner_type";
// export const ManagingOfficerTypeKey = "managing_officer_type";

export enum BeneficialOwnerTypeChoice {
    individual = "individualOwner",
    otherLegal = "otherLegalOwner",
    government = "governmentOrPublicOwner"
}

export enum ManagingOfficerTypeChoice {
    individual = "individualOfficer",
    corporate = "corporateOfficer"
}
