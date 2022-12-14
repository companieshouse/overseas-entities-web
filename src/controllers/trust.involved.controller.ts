import { NextFunction, Request, Response } from 'express';
import { TrusteeTypeChoice } from '../model/trustee.type.model';
import * as config from '../config';
import { logger } from '../utils/logger';

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

    const templateName = config.TRUST_INVOLVED_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: `${config.TRUST_DETAILS_URL}/${req.params['id']}`,
        templateName,
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
        case TrusteeTypeChoice.historical:
          logger.info("TODO: Route to trust-historical-beneficial-owner page ");
          if (isValidUrl (url) ) {

            return res.redirect(url);
          }
          break;
        case TrusteeTypeChoice.individual:
          logger.info("TODO: Route to trust-individual page when story coded ");
          if (isValidUrl (url) ) {

            return res.redirect(url);
          }
          break;
        case TrusteeTypeChoice.legalEntity:
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

// Required for Sonar rule tssecurity:S5146
function isValidUrl(url: string) {
  if (url.startsWith(config.TRUST_INVOLVED_URL)) {

    return true;
  }

  return false;
}


export {
  get,
  post,
  TRUST_INVOLVED_TEXTS,
};
