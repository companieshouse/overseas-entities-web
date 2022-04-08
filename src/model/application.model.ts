import {
  entityType,
  presenterType,
  dataType,
  beneficialOwnerGovType,
  beneficialOwnerOtherType,
  beneficialOwnerTypeType,
  managingOfficerTypeType,
  beneficialOwnerStatementType,
  beneficialOwnerIndividualType,
  managingOfficerCorporateType,
  managingOfficerType
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    beneficialOwnerType?: beneficialOwnerTypeType.BeneficialOwnerType;
    managingOfficerType?: managingOfficerTypeType.ManagingOfficerType;
    beneficialOwnerStatement?: beneficialOwnerStatementType.BeneficialOwnerStatement;
    beneficialOwnerOther?: beneficialOwnerOtherType.BeneficialOwnerOther;
    beneficialOwnerIndividual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual;
    beneficialOwnerGov?: beneficialOwnerGovType.BeneficialOwnerGov;
    managingOfficerCorporate?: managingOfficerCorporateType.ManagingOfficerCorporate;
    managingOfficer?: managingOfficerType.ManagingOfficer;
}

export type ApplicationDataType = presenterType.Presenter | entityType.Entity | dataType.Address | beneficialOwnerTypeType.BeneficialOwnerType | managingOfficerTypeType.ManagingOfficerType | beneficialOwnerOtherType.BeneficialOwnerOther | beneficialOwnerIndividualType.BeneficialOwnerIndividual | managingOfficerCorporateType.ManagingOfficerCorporate | beneficialOwnerGovType.BeneficialOwnerGov | managingOfficerType.ManagingOfficer;
