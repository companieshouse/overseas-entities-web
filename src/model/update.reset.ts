
import { ApplicationData } from "./application.model";
import { Update } from "./update.type.model";

export const resetEntityUpdate = (appData: ApplicationData): Update => {
  appData.update = {};
  return appData.update;
};

