import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { getApplicationData } from '../utils/application.data';
import * as mapperBo from '../utils/trust/historical.beneficial.owner.mapper';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { TrustKey } from '../model/trust.model';

const HISTORICAL_BO_TEXTS = {
  title: 'Tell us about the former beneficial owner',
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trustData: PageModel.TrustDetails = mapperBo.mapTrustToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );

    const templateName = config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: `${config.TRUST_INVOLVED_URL}/${trustId}`,
        templateName,
        pageParams: {
          title: HISTORICAL_BO_TEXTS.title,
        },
        trustData,
      },
    );
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

    const url = `${config.TRUST_INVOLVED_URL}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`;

    return safeRedirect(res, url);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  HISTORICAL_BO_TEXTS,
};
