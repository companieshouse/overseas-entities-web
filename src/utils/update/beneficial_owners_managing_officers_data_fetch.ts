import { ApplicationData } from "../../model";

export const hasFetchedBoAndMoData = (appData: ApplicationData) => appData?.update?.bo_mo_data_fetched ? true : false;

export const setFetchedBoMoData = (appData: ApplicationData) => {
  if (!appData.update) {
    appData.update = {};
  }
  appData.update.bo_mo_data_fetched = true;
};
