export interface Address {
    addressLine1?: string
    addressLine2?: string
    town?: string
    county?: string
    postcode?: string
}

export enum yesNoResponse {
    No = 0,
    Yes = 1
}

export enum BeneficialOwnerTypeChoice {
    individual = "individual",
    otherLegal = "otherLegal",
    none = "none"
}
