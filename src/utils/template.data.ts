import { isActiveFeature } from "./feature.flag";
import * as config from "../config";
import { getUrlWithParamsToPath } from "./url";
import { Request } from "express";

export const addActiveSubmissionBasePathToTemplateData = (templateData: Object, req: Request) => {
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    templateData["FEATURE_FLAG_ENABLE_REDIS_REMOVAL"] = true;
    templateData["activeSubmissionBasePath"] = getUrlWithParamsToPath(config.ACTIVE_SUBMISSION_BASE_PATH, req);
  }
};
