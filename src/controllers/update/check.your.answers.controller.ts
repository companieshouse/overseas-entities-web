import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";

import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";
import { getApplicationData } from '../../utils/application.data';
import { checkEntityRequiresTrusts } from '../../utils/trusts';

export const get = (req: Request, res: Response, next: NextFunction) => {
  const updateTrustsEnabled = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS);
  const hasAnyBosWithTrusteeNocs = checkEntityRequiresTrusts(getApplicationData(req.session));

  const backLinkUrl = updateTrustsEnabled && hasAnyBosWithTrusteeNocs
    ? config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL
    : config.UPDATE_BENEFICIAL_OWNER_TYPE_URL;

  getDataForReview(req, res, next, config.UPDATE_CHECK_YOUR_ANSWERS_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDataForReview(req, res, next);
};
