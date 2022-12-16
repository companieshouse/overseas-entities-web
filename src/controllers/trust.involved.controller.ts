import { NextFunction, Request, Response } from 'express';
import { TrusteeType } from '../model/trustee.type.model';
import * as config from '../config';
import { logger } from '../utils/logger';
import { ApplicationData } from '../model/application.model';
import { getApplicationData } from '../utils/application.data';
import { TrustKey } from '../model/trust.model';
import { mapTrustWhoIsInvolvedToPage } from '../utils/trust/who.is.Involved.mapper';
import * as PageModel from '../model/trust.page.model';

const TRUST_INVOLVED_TEXTS = {
  title: 'Individuals or entities involved in the trust',
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // Get current Trust from session and map to page data
    const trustId = req.params["id"];
    const appData: ApplicationData = getApplicationData(req.session);
    const pageData: PageModel.TrustWhoIsInvolved = mapTrustWhoIsInvolvedToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );

    const templateName = config.TRUST_INVOLVED_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: `${config.TRUST_DETAILS_URL}/${req.params['id']}`,
        templateName,
        pageData: pageData,
        pageParams: {
          title: TRUST_INVOLVED_TEXTS.title,
          checkYourAnswersUrl: config.CHECK_YOUR_ANSWERS_URL,
        },
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

    if (req.body.noMoreToAdd) {
      return res.redirect(config.CHECK_YOUR_ANSWERS_URL);
    }

    const typeOfTrustee = req.body.typeOfTrustee;
    // the req.params['id'] is already validated in the has.trust.middleware but sonar can not recognise this.
    const url = `${config.TRUST_INVOLVED_URL}/${req.params['id']}`;

    switch (typeOfTrustee) {
        case TrusteeType.HISTORICAL:
          logger.info("TODO: Route to trust-historical-beneficial-owner page ");
          if (isValidUrl (url) ) {
            return res.redirect(url);
          }
          break;
        case TrusteeType.INDIVIDUAL:
          logger.info("TODO: Route to trust-individual page when story coded ");
          if (isValidUrl (url) ) {
            return res.redirect(url);
          }
          break;
        case TrusteeType.LEGAL_ENTITY:
          logger.info("TODO: Route to trust-ole page when story coded ");
          if (isValidUrl (url) ) {
            return res.redirect(url);
          }
          break;
        default:
          logger.info("TODO: On validation No trustee selected, re-displaying page");
          if (isValidUrl (url) ) {
            return res.redirect(url);
          }
    }

  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

// Required for Sonar rule tssecurity:S5146 (this will never happen but Sonar can not understand middleware in this case)
const isValidUrl = (url: string) => {
  if (url.startsWith(config.REGISTER_AN_OVERSEAS_ENTITY_URL)) {
    return true;
  }

  throw new Error('Security failure with URL ' + url);
};

export {
  get,
  post,
  TRUST_INVOLVED_TEXTS,
};
