import { yesNoResponse, InputDate } from "./data.types.model";

export const UpdateKey = "update";
export const RegistrableBeneficialOwnerKey = "registrable_beneficial_owner";

export const UpdateKeys: string[] = [ "date_of_creation", "bo_mo_data_fetched", "registrable_beneficial_owner" ];

export interface Update {
    date_of_creation?: InputDate;
    bo_mo_data_fetched?: boolean;
    registrable_beneficial_owner?: yesNoResponse;
}

