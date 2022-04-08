export const PresenterKey = "presenter";
/*
  The Presenter fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const PresenterKeys: string[] = ["fullName", "phoneNumber", "role", "roleTitle", "registrationNumber"];
export interface Presenter {
    fullName?: string
    phoneNumber?: string
    role?: presenterRole
    roleTitle?: string
    registrationNumber?: number
}

export enum presenterRole {
  administrator = "administrator",
  agent = "agent",
  solicitor = "solicitor",
  beneficialOwner = "beneficialOwner",
  other = "other"
}
