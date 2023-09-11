import { BeneficialOwnerGov } from "./beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "./beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "./beneficial.owner.other.model";
import { yesNoResponse, InputDate } from "./data.types.model";
import { ManagingOfficerCorporate } from "./managing.officer.corporate.model";
import { ManagingOfficerIndividual } from "./managing.officer.model";
import { Trust } from "./trust.model";

export const UpdateKey = "update";
export const RegistrableBeneficialOwnerKey = "registrable_beneficial_owner";
export const NoChangeKey = "no_change";

export const UpdateKeys: string[] = [
  "date_of_creation",
  "bo_mo_data_fetched",
  "registrable_beneficial_owner",
  "review_beneficial_owners_individual",
  "review_beneficial_owners_corporate",
  "review_beneficial_owners_government_or_public_authority",
  "review_managing_officers_individual",
  "review_managing_officers_corporate",
  "filing_date",
  "no_change"
];

export interface Update {
  date_of_creation?: InputDate;
  // used to indicate that data is fetched from the endpoint and saved into DB hence does not need to be fetched again
  bo_mo_data_fetched?: boolean;
  // Flag for whether a person has become or ceased to be a registrable BO in the update period or not
  registrable_beneficial_owner?: yesNoResponse;
  review_beneficial_owners_individual?: BeneficialOwnerIndividual[];
  review_beneficial_owners_corporate?: BeneficialOwnerOther[];
  review_beneficial_owners_government_or_public_authority?: BeneficialOwnerGov[];
  review_managing_officers_individual?: ManagingOfficerIndividual[];
  review_managing_officers_corporate?: ManagingOfficerCorporate[];
  filing_date?: InputDate;
  no_change?: boolean;
  trust_data_fetched?: boolean;
  review_trusts?: Trust[];
}

