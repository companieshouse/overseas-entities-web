import * as config from "../../config";
import { isActiveFeature } from "../feature.flag";
import { ApplicationData } from '../../model';
import { mapTrustApiReturnModelToWebModel } from '../trusts';

export const mapTrustApiToWebWhenFlagsAreSet = (appData: ApplicationData, isRegistration: boolean) => {
  if (isRegistration && isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)) {
      mapTrustApiReturnModelToWebModel(appData);
    }
  }
};
