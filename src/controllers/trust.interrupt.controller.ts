import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';

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

    const pageProps = {
      backLinkUrl: `${config.BENEFICIAL_OWNER_TYPE_URL}`,
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
    return safeRedirect(res, `${config.TRUST_ENTRY_URL + "/" + firstTrustId}`);
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
