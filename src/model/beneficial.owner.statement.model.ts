export const BeneficialOwnerStatementKey = "beneficial_owners_statement";

export enum BeneficialOwnerStatementChoice {
    allIdentifiedAllSupplied = "allIdentifiedAllSupplied",
    allIdentifiedSomeSupplied = "allIdentifiedSomeSupplied",
    someIdentifiedAllDetails = "someIdentifiedAllDetails",
    someIdentifiedSomeDetails = "someIdentifiedSomeDetails",
    noneIdentified = "noneIdentified"
}
