import { yesNoResponse } from "./data.types.model";

export const UpdateKey = "update";
export const RegistrableBeneficialOwnerKey = "registrable_beneficial_owner";

export const UpdateKeys: string[] = [ "date_of_creation", "bo_mo_data", "registrable_beneficial_owner" ];

export interface Update {
    date_of_creation?: string;
    bo_mo_data?: true;
    registrable_beneficial_owner?: yesNoResponse;
}

