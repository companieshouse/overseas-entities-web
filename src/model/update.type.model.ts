export const UpdateKey = "update";

export const UpdateKeys: string[] = [ "date_of_creation" ];

export interface Update {
    date_of_creation?: string,
    fetchedBoMoData?: true
}
