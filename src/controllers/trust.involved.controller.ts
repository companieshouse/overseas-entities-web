import { NextFunction, Request, Response } from 'express';
import { TrusteeType } from '../model/trustee.type.model';
import * as config from '../config';
import { logger } from '../utils/logger';
import { mapTrustWhoIsInvolvedToPage } from '../utils/trust/who.is.involved.mapper';
import { getApplicationData } from '../utils/application.data';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { TrustWhoIsInvolved } from '../model/trust.page.model';

const TRUST_INVOLVED_TEXTS = {
  title: 'Individuals or entities involved in the trust',
  boTypeTitle: {
    [BeneficialOwnerTypeChoice.individual]: 'Individual beneficial owner',
    [BeneficialOwnerTypeChoice.otherLegal]: 'Other legal beneficial owner',
  },
};

type TrustInvolvedPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageData: {
    beneficialOwnerTypeTitle: Record<string, string>;
    trusteeType: typeof TrusteeType;
    checkYourAnswersUrl: string;
    beneficialOwnerUrlDetach: string;
  } & TrustWhoIsInvolved,
  pageParams: {
    title: string;
  },
};

const getPageProperties = (
  req: Request,
): TrustInvolvedPageProperties => {
  const trustId = req.params[config.TRUST_ID_PATH_PARAMETER];

  return {
    backLinkUrl: `${config.TRUST_DETAILS_URL}/${trustId}`,
    templateName: config.TRUST_INVOLVED_PAGE,
    pageParams: {
      title: TRUST_INVOLVED_TEXTS.title,
    },
    pageData: {
      ...mapTrustWhoIsInvolvedToPage(getApplicationData(req.session), trustId),
      beneficialOwnerTypeTitle: TRUST_INVOLVED_TEXTS.boTypeTitle,
      trusteeType: TrusteeType,
      checkYourAnswersUrl: config.CHECK_YOUR_ANSWERS_URL,
      beneficialOwnerUrlDetach: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_BENEFICIAL_OWNER_DETACH_URL}`,
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

    return res.render(      pageProps.templateName, pageProps);
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
    // let url = `${config.TRUST_ENTRY_URL}/${req.params['trustId']}`;
    let url = `${config.TRUST_INVOLVED_URL}/${req.params[`${config.TRUST_ID_PATH_PARAMETER}`]}`;

    switch (typeOfTrustee) {
        case TrusteeType.HISTORICAL:
          logger.info("TODO: Route to trust-historical-beneficial-owner page ");
          url += config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;
          // url += config.TRUST_TRUSTEE_HISTORICAL_INDIVIDUAL_URL;

          break;
        case TrusteeType.INDIVIDUAL:
          logger.info("TODO: Route to trust-individual page when story coded ");

          url += config.TRUST_TRUSTEE_INDIVIDUAL_URL;

          break;
        case TrusteeType.LEGAL_ENTITY:
          logger.info("TODO: Route to trust-ole page when story coded ");

          url += config.TRUST_TRUSTEE_LEGAL_ENTITY_URL;

          break;
        default:
          logger.info("TODO: On validation No trustee selected, re-displaying page");
    }

    checkIsValidUrl(url);

    return res.redirect(url);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

// Required for Sonar rule tssecurity:S5146 (this will never happen but Sonar can not understand middleware in this case)
const checkIsValidUrl = (url: string): void => {
  if (url.startsWith(config.TRUST_ENTRY_URL)) {
    return;
  }

  throw new Error('Security failure with URL ' + url);
};

export {
  get,
  post,
  TRUST_INVOLVED_TEXTS,
};
