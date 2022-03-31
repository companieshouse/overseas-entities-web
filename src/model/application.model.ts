import {
  entityType,
  presenterType,
  dataType,
  beneficialOwnerOtherType,
  beneficialOwnerTypeType,
  beneficialOwnerIndividualType,
  managingOfficerCorportateType
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    beneficialOwnerType?: beneficialOwnerTypeType.BeneficialOwnerType;
    beneficialOwnerOther?: beneficialOwnerOtherType.BeneficialOwnerOther;
    beneficialOwnerIndividual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual;
    managingOfficerCorporate?: managingOfficerCorportateType.ManagingOfficerCorporate;
}

export type ApplicationDataType = presenterType.Presenter | entityType.Entity | dataType.Address | beneficialOwnerTypeType.BeneficialOwnerType | beneficialOwnerOtherType.BeneficialOwnerOther | beneficialOwnerIndividualType.BeneficialOwnerIndividual | managingOfficerCorportateType.ManagingOfficerCorporate;
