import { BeneficialOwnerIndividual } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../model/beneficial.owner.other.model";
import { BeneficialOwnerGov } from "../model/beneficial.owner.gov.model";
import { ManagingOfficerIndividual } from "../model/managing.officer.model";
import { ManagingOfficerCorporate } from "./managing.officer.corporate.model";

import { yesNoResponse, InputDate } from "./data.types.model";

export const UpdateKey = "update";

export const UpdateKeys: string[] = [
  "date_of_creation",
  "date_of_filing",
  "bo_mo_data",
  "beneficial_owners_individual",
  "beneficial_owners_corporate",
  "beneficial_owners_government_or_public_authority",
  "managing_officers_individual",
  "managing_officers_corporate"
];

export interface Update {
    date_of_creation?: InputDate;
    date_of_ceasation?: InputDate;
    date_of_filing?: InputDate; // To be used for start & ceased date validation.
    bo_mo_data?: yesNoResponse;
    registrable_beneficial_owner?: yesNoResponse;
    any_beneficial_owners_ceased_or_added?: yesNoResponse;
    // Benefitial Owner Statement is in main part of model.
    beneficial_owners_individual?: BeneficialOwnerIndividual[];
    beneficial_owners_corporate?: BeneficialOwnerOther[];
    beneficial_owners_government_or_public_authority?: BeneficialOwnerGov[];
    managing_officers_individual?: ManagingOfficerIndividual[];
    managing_officers_corporate?: ManagingOfficerCorporate[];
}
