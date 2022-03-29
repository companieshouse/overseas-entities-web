import { entityType, presenterType, officerType, dataType } from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: presenterType.Presenter;
    entity?: entityType.Entity;
    officer?: officerType.Officer;
}

export type ApplicationDataType = presenterType.Presenter | entityType.Entity | dataType.Address;
