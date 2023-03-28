import { yesNoResponse } from "model/data.types.model";
import { ApplicationData } from "../../model";

export const hasFetchedBoAndMoData = (appData: ApplicationData) => appData?.update?.bo_mo_data === yesNoResponse.Yes ?? false;

export const setFetchedBoMoData = (appData: ApplicationData) => {
  if (!appData.update) {
    appData.update = {};
  }
  appData.update.bo_mo_data = yesNoResponse.Yes;
};
