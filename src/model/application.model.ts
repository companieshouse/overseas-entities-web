import {
  entityType,
  presenterType,
  dataType,
  beneficialOwnerGovType,
  beneficialOwnerOtherType,
  beneficialOwnerStatementType,
  beneficialOwnerIndividualType,
  managingOfficerCorporateType,
  managingOfficerType
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    beneficial_owners_statement?: beneficialOwnerStatementType.BeneficialOwnerStatementType;
    beneficial_owners_individual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
    beneficial_owners_corporate?: beneficialOwnerOtherType.BeneficialOwnerOther[];
    beneficial_owners_government_or_public_authority?: beneficialOwnerGovType.BeneficialOwnerGov[];
    managingOfficer?: managingOfficerType.ManagingOfficer[];
    managingOfficerCorporate?: managingOfficerCorporateType.ManagingOfficerCorporate[];
}

export const ApplicationDataArrayType = [
  "beneficial_owners_individual",
  "beneficial_owners_corporate",
  "beneficial_owners_government_or_public_authority",
  "managingOfficer",
  "managingOfficerCorporate"
];

export type ApplicationDataType =
  | presenterType.Presenter
  | entityType.Entity
  | beneficialOwnerOtherType.BeneficialOwnerOther
  | beneficialOwnerIndividualType.BeneficialOwnerIndividual
  | beneficialOwnerGovType.BeneficialOwnerGov
  | managingOfficerCorporateType.ManagingOfficerCorporate
  | managingOfficerType.ManagingOfficer
  | dataType.Address;
