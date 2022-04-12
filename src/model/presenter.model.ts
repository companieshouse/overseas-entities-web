export const PresenterKey = "presenter";
/*
  The Presenter fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const PresenterKeys: string[] = ["full_name", "phone_number", "role", "role_title", "anti_money_laundering_registration_number"];
export interface Presenter {
    full_name?: string
    phone_number?: string
    role?: presenterRole
    role_title?: string
    anti_money_laundering_registration_number?: string
}

enum presenterRole {
  administrator = "administrator",
  agent = "agent",
  solicitor = "solicitor",
  beneficial_owner = "beneficial_owner",
  other = "other"
}
