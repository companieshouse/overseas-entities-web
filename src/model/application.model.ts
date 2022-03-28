import { entityType, presenterType, dataType, beneficialOwnerTypeType } from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    beneficialOwnerType?: beneficialOwnerTypeType.BeneficialOwnerType;
}

export type ApplicationDataType = presenterType.Presenter | entityType.Entity | dataType.Address | beneficialOwnerTypeType.BeneficialOwnerType;
