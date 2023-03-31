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
  "date_of_ceasation",
  "bo_mo_data_fetched",
  "review_beneficial_owners_individual",
  "review_beneficial_owners_corporate",
  "review_beneficial_owners_government_or_public_authority",
  "review_managing_officers_individual",
  "review_managing_officers_corporate",
  "any_beneficial_owners_ceased_or_added",
  "next_filing_due"
];

export interface Update {
    date_of_creation?: InputDate;
    date_of_ceasation?: InputDate;
    date_of_filing?: InputDate; // To be used for start & ceased date validation. Assumption: Start dates are take from notified_on in BO/MOs.
    next_filing_due?: InputDate; // Assumption that next_due in company profile confirmation statement can be used.
    registrable_beneficial_owner?: yesNoResponse;
    any_beneficial_owners_ceased_or_added?: yesNoResponse;
    bo_mo_data_fetched?: boolean;
    // Benefitial Owner Statement is in main part of model.
    review_beneficial_owners_individual?: BeneficialOwnerIndividual[];
    review_beneficial_owners_corporate?: BeneficialOwnerOther[];
    review_beneficial_owners_government_or_public_authority?: BeneficialOwnerGov[];
    review_managing_officers_individual?: ManagingOfficerIndividual[];
    review_managing_officers_corporate?: ManagingOfficerCorporate[];
}
