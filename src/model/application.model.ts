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
    beneficial_owners_statement?: beneficialOwnerStatementType.BeneficialOwnerStatementChoice;
    beneficial_owners_individual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
    beneficialOwnerOther?: beneficialOwnerOtherType.BeneficialOwnerOther[];
    beneficialOwnerGov?: beneficialOwnerGovType.BeneficialOwnerGov[];
    managingOfficer?: managingOfficerType.ManagingOfficer[];
    managingOfficerCorporate?: managingOfficerCorporateType.ManagingOfficerCorporate[];
}

export const ApplicationDataArrayType = [
  "beneficial_owners_individual",
  "beneficialOwnerOther",
  "beneficialOwnerGov",
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
