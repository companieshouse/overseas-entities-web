import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getApplicationData } from '../utils/application.data';
import { mapCommonTrustDataToPage } from '../utils/trust/common.trust.data.mapper';
import * as PageModel from '../model/trust.page.model';
import { safeRedirect } from '../utils/http.ext';

const TRUST_INTERRUPT_TEXTS = {
  title: 'You now need to submit trust information',
};

type TrustDetailPageProperties = {
  backLinkUrl: string;
  templateName: string;
  pageParams: {
    title: string;
  };
  pageData: {
    trustData: PageModel.CommonTrustData;
  };
};

const getPageProperties = (
  req: Request,
): TrustDetailPageProperties => {
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

  const appData = getApplicationData(req.session);

  return {
    backLinkUrl: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`,
    templateName: config.TRUST_INTERRUPT_PAGE,
    pageParams: {
      title: TRUST_INTERRUPT_TEXTS.title,
    },
    pageData: {
      trustData: mapCommonTrustDataToPage(appData, trustId),
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

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    return safeRedirect(res, `${config.TRUST_ENTRY_URL}/${trustId}`);
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
