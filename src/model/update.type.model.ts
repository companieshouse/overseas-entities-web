import { BeneficialOwnerGov } from "./beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "./beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "./beneficial.owner.other.model";
import { yesNoResponse } from "./data.types.model";
import { ManagingOfficerCorporate } from "./managing.officer.corporate.model";
import { ManagingOfficerIndividual } from "./managing.officer.model";

export const UpdateKey = "update";
export const RegistrableBeneficialOwnerKey = "registrable_beneficial_owner";

export const UpdateKeys: string[] = [
     "date_of_creation", "bo_mo_data", "registrable_beneficial_owner",
     "review_beneficial_owners_individual",
     "review_beneficial_owners_corporate",
     "review_beneficial_owners_government_or_public_authority",
     "review_managing_officers_individual",
     "review_managing_officers_corporate",
    ];

export interface Update {
    date_of_creation?: string;
    bo_mo_data?: true;
    registrable_beneficial_owner?: yesNoResponse;
    review_beneficial_owners_individual?: BeneficialOwnerIndividual[];
    review_beneficial_owners_corporate?: BeneficialOwnerOther[];
    review_beneficial_owners_government_or_public_authority?: BeneficialOwnerGov[];
    review_managing_officers_individual?: ManagingOfficerIndividual[];
    review_managing_officers_corporate?: ManagingOfficerCorporate[];
}

