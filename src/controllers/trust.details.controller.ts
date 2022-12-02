import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getApplicationData, setExtraData } from '../utils/application.data';
import * as mapperToPageService from '../utils/trust/mapper.to.page';
import * as mapperToSessionService from '../utils/trust/mapper.to.session';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { Trust, TrustKey } from '../model/trust.model';

const TRUST_DETAILS_TEXTS = {
  title: 'Tell us about the trust',
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const trustId = req.params['id'];
    const pageData: PageModel.TrustDetails = mapperToPageService.mapDetailToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );

    const templateName = config.TRUST_DETAILS_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
        templateName,
        pageParams: {
          title: TRUST_DETAILS_TEXTS.title,
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

    const trustId = req.params['id'];

    //  get trust data from session
    const appData: ApplicationData = getApplicationData(req.session);
    const trusts: Trust[] = appData[TrustKey] ?? [];
    const trustIndex = trusts.findIndex(trust => trust.trust_id === trustId);

    // remove trust from the array of trusts   if it is present in the trusts array
    if (trustIndex >= 0) {
      trusts?.splice(trustIndex, 1);
    }

    //  map form data to session trust data
    const details = mapperToSessionService.mapDetailToSession(req.body);

    //  add new details to session trusts array
    if (!details.trust_id) {
      details.trust_id = String(trusts.length + 1);
    }

    trusts.push(details);

    //  save to session
    setExtraData(
      req.session,
      {
        ...appData,
        [TrustKey]: trusts,
      },
    );

    return res.redirect(config.TRUST_DETAILS_URL);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  TRUST_DETAILS_TEXTS,
};
