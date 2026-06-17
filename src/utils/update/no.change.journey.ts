import * as config from "../../config";
import { ApplicationData } from "../../model";
import { isActiveFeature } from "../feature.flag";
import { checkRelevantPeriod } from "../relevant.period";

export const isNoChangeJourney = (appData: ApplicationData): boolean => {
  const relevantPeriodNoChange: boolean = isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) ? !checkRelevantPeriod(appData) : true;
  return !!appData.update?.no_change && relevantPeriodNoChange;
};
