export interface Address {
    addressLine1: string
    addressLine2?: string
    town: string
    county: string
    postcode: string
}

export interface Date {
    day: number
    month: number
    year: number
}

export enum userResponse {
    No = 0,
    Yes = 1
  }

export enum natureOfControl {
    over25under50,
    over50under75,
    over75
  }
