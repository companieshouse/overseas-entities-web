import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${config.INTERRUPT_CARD_PAGE}`);

  return res.render(config.INTERRUPT_CARD_PAGE, {
    backLinkUrl: config.SECURE_REGISTER_FILTER_URL,
    templateName: config.INTERRUPT_CARD_PAGE,
    pageParams: {
      isTrustFeatureEnabled: isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB),
    },
  });
};
