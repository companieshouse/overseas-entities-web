import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { getApplicationData } from '../utils/application.data';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import * as PageModel from '../model/trust.page.model';

const INDIVIDUAL_BO_TEXTS = {
  title: 'Tell us about the individual',
};

type TrustIndividualBeneificalOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  trustData: {
    id: string,
    trustName: string,
  } & PageModel.CommonTrustData,
  pageParams: {
    title: string;
  },
};

const getPageProperties = (
  req: Request,
): TrustIndividualBeneificalOwnerPageProperties => {
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

  return {
    backLinkUrl: `${config.TRUST_INVOLVED_URL}/${trustId}`,
    templateName: config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
    pageParams: {
      title: INDIVIDUAL_BO_TEXTS.title,
    },
    trustData: {
      ...CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId),
    },
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties(req);

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
  INDIVIDUAL_BO_TEXTS,
};
