import { ApplicationData } from "../../model";

export const hasFetchedBoAndMoData = (appData: ApplicationData) => appData?.update?.fetchedBoMoData ?? false;

export const setFetchedBoMoData = (appData: ApplicationData) => {
  if (!appData.update) {
    appData.update = {};
  }
  appData.update.fetchedBoMoData = true;
};
