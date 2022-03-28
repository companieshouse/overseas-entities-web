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


export interface Date {
    day: number
    month: number
    year: number
}

export enum natureOfControl {
    over25under50,
    over50under75,
    over75
}
