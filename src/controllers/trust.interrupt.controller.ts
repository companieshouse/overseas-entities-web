import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { isActiveFeature } from '../utils/feature.flag';
import { getUrlWithParamsToPath } from "../utils/url";

const TRUST_INTERRUPT_TEXTS = {
  title: 'You now need to submit trust information',
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req) : config.BENEFICIAL_OWNER_TYPE_URL;
    const pageProps = {
      backLinkUrl,
      templateName: config.TRUST_INTERRUPT_PAGE,
      pageParams: {
        title: TRUST_INTERRUPT_TEXTS.title,
      },
      url: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
    };
    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const post = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const firstTrustId = "1";
    let trustEntryUrl = config.TRUST_ENTRY_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      trustEntryUrl = getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req);
    }
    return safeRedirect(res, `${trustEntryUrl + "/" + firstTrustId}`);
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

export {
  get,
  post,
  TRUST_INTERRUPT_TEXTS,
};
