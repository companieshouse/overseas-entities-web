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
    beneficialOwnerIndividual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
    beneficialOwnerOther?: beneficialOwnerOtherType.BeneficialOwnerOther;
    beneficialOwnerGov?: beneficialOwnerGovType.BeneficialOwnerGov;
    managingOfficerCorporate?: managingOfficerCorporateType.ManagingOfficerCorporate;
    managingOfficer?: managingOfficerType.ManagingOfficer;
}

export const ApplicationDataArrayType = [
  "beneficialOwnerOther",
  "beneficialOwnerIndividual",
  "beneficialOwnerGov",
  "managingOfficerCorporate",
  "managingOfficer",
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
