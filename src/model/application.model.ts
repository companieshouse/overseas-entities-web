import { Entity, Presenter } from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    presenter?: Presenter;
    entity?: Entity;
}

export type ApplicationDataType = Presenter | Entity;
