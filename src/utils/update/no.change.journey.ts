import { checkRelevantPeriod } from "../relevant.period";
import { isActiveFeature } from "../feature.flag";
import * as config from "../../config";
import { ApplicationData } from "../../model";

export const isNoChangeJourney = (appData: ApplicationData): boolean => {
  const relevantPeriodNoChange: boolean = isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) ? !checkRelevantPeriod(appData) : true;
  return !!appData.update?.no_change && relevantPeriodNoChange;
};
