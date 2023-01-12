import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { isValidUrl } from '../utils/validate.url';
import { getApplicationData } from '../utils/application.data';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { TrustKey } from '../model/trust.model';

const INDIVIDUAL_BO_TEXTS = {
  title: 'Tell us about the individual',
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
    const trustData: PageModel.CommonTrustData = CommonTrustDataMapper.mapCommonTrustDataToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );

    const templateName = config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: `${config.TRUST_INVOLVED_URL}/${trustId}`,
        templateName,
        pageParams: {
          title: INDIVIDUAL_BO_TEXTS.title,
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

    const url = `${config.TRUST_INVOLVED_URL}/${req.params[`${config.TRUST_ID_PATH_PARAMETER}`]}`;

    if (isValidUrl(url)) {
      return res.redirect(url);
    }

  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  INDIVIDUAL_BO_TEXTS,
};
