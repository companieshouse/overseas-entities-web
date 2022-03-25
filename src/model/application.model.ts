import { entityType, presenterType, dataType } from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
}

export type ApplicationDataType = presenterType.Presenter | entityType.Entity | dataType.Address;
