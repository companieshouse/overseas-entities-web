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
    beneficialOwnerStatement?: beneficialOwnerStatementType.BeneficialOwnerStatement;
    beneficialOwnerOther?: beneficialOwnerOtherType.BeneficialOwnerOther;
    beneficialOwnerIndividual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
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
  | dataType.Address
  | beneficialOwnerOtherType.BeneficialOwnerOther
  | beneficialOwnerIndividualType.BeneficialOwnerIndividual
  | managingOfficerCorporateType.ManagingOfficerCorporate
  | beneficialOwnerGovType.BeneficialOwnerGov
  | managingOfficerType.ManagingOfficer;
