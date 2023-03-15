export const UpdateKey = "update";

export const UpdateKeys: string[] = [ "date_of_creation", "bo_mo_data" ];

export interface Update {
    date_of_creation?: string,
    bo_mo_data?: true
}
