import {
  entityType,
  presenterType,
  dataType,
  beneficialOwnerGovType,
  beneficialOwnerOtherType,
  beneficialOwnerStatementType,
  beneficialOwnerIndividualType,
  managingOfficerCorporateType,
  managingOfficerType,
  paymentType
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    beneficial_owners_statement?: beneficialOwnerStatementType.BeneficialOwnersStatementType;
    beneficial_owners_individual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
    beneficial_owners_corporate?: beneficialOwnerOtherType.BeneficialOwnerOther[];
    beneficial_owners_government_or_public_authority?: beneficialOwnerGovType.BeneficialOwnerGov[];
    managing_officers_individual?: managingOfficerType.ManagingOfficerIndividual[];
    managing_officers_corporate?: managingOfficerCorporateType.ManagingOfficerCorporate[];
    payment?: paymentType.Payment;
}

export const ApplicationDataArrayType = [
  "beneficial_owners_individual",
  "beneficial_owners_corporate",
  "beneficial_owners_government_or_public_authority",
  "managing_officers_individual",
  "managing_officers_corporate"
];

export type ApplicationDataType =
  | presenterType.Presenter
  | entityType.Entity
  | beneficialOwnerOtherType.BeneficialOwnerOther
  | beneficialOwnerIndividualType.BeneficialOwnerIndividual
  | beneficialOwnerGovType.BeneficialOwnerGov
  | managingOfficerCorporateType.ManagingOfficerCorporate
  | managingOfficerType.ManagingOfficerIndividual
  | paymentType.Payment
  | dataType.Address;
