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

    switch (typeOfTrustee) {
        case TrusteeTypeChoice.historical:
          logger.info("TODO: Route to trust-historical-beneficial-owner page ");
          break;
        case TrusteeTypeChoice.individual:
          logger.info("TODO: Route to trust-individual page ");
          break;
        case TrusteeTypeChoice.legalEntity:
          logger.info("TODO: Route to trust-ole page ");
          break;
        default:
          logger.info("Error message and stay in same page ");
    }
    logger.info("For Current story, just re-displays the page (delete this comment and below line once all Trustee pages are done");
    return res.redirect(`${config.TRUST_INVOLVED_URL}/${req.params['id']}`);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};


export {
  get,
  post,
  TRUST_INVOLVED_TEXTS,
};
