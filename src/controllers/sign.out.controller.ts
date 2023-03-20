import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const pageUrl = req.originalUrl;
    const isTrustPage = /\/trusts/i.test(pageUrl);
    const trustUrl = trustId ? `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.TRUSTS_URL}/${trustId}/${req.query["page"]}` :
      `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.TRUSTS_URL}/${req.query["page"]}`;
    const previousPageUrl = isTrustPage ? trustUrl :
      `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`;

    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: previousPageUrl,
      url: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
      saveAndResume: isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022),
      journey: "register"
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SIGN_OUT_PAGE}`);
    const previousPage = req.body["previousPage"];

    if (!previousPage.startsWith(config.REGISTER_AN_OVERSEAS_ENTITY_URL)){
      throw createAndLogErrorRequest(req, `${previousPage} page is not part of the journey!`);
    }

    if (req.body["sign_out"] === 'yes') {
      return res.redirect(config.ACCOUNTS_SIGN_OUT_URL);
    }

    return res.redirect(previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
