import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getApplicationData } from '../utils/application.data';
import * as historicalBoMapper from '../utils/trust/historical.beneficial.owner.mapper';
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

    const trustId = req.params[config.TRUST_ID_PATH_PARAMETER];
    const pageData: PageModel.TrustHistoricalBeneficialOwnerPage = historicalBoMapper.mapTrustDetailToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );
    console.log(pageData.trustName);

    const templateName = config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE;
    console.log("i am here");
    console.log(`${config.TRUST_INVOLVED_URL}/${trustId}`);

    return res.render(
      templateName,
      {
        backLinkUrl: `${config.TRUST_INVOLVED_URL}/${trustId}`,
        templateName,
        pageParams: {
          title: HISTORICAL_BO_TEXTS.title,
        },
        pageData,
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
    console.log("look out");
    console.log(req.params[config.TRUST_ID_PATH_PARAMETER]);

    const url = `${config.TRUST_INVOLVED_URL}/${req.params[`${config.TRUST_ID_PATH_PARAMETER}`]}`;

    return res.redirect(url);

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
