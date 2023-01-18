import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { TrusteeType } from '../model/trustee.type.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { CommonTrustData, TrustWhoIsInvolved } from '../model/trust.page.model';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { getApplicationData } from '../utils/application.data';
import { mapCommonTrustDataToPage } from '../utils/trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from '../utils/trust/who.is.involved.mapper';

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
    trustData: CommonTrustData,
  } & TrustWhoIsInvolved,
  pageParams: {
    title: string;
  },
};

const getPageProperties = (
  req: Request,
): TrustInvolvedPageProperties => {
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

  return {
    backLinkUrl: `${config.TRUST_DETAILS_URL}/${trustId}`,
    templateName: config.TRUST_INVOLVED_PAGE,
    pageParams: {
      title: TRUST_INVOLVED_TEXTS.title,
    },
    pageData: {
      trustData: mapCommonTrustDataToPage(getApplicationData(req.session), trustId),
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

    if (req.body.noMoreToAdd) {
      return res.redirect(config.CHECK_YOUR_ANSWERS_URL);
    }

    const typeOfTrustee = req.body.typeOfTrustee;

    // the req.params['id'] is already validated in the has.trust.middleware but sonar can not recognise this.
    let url = `${config.TRUST_ENTRY_URL}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`;

    switch (typeOfTrustee) {
        case TrusteeType.HISTORICAL:
          url += config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;
          break;
        case TrusteeType.INDIVIDUAL:
          url += config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;
          break;
        case TrusteeType.LEGAL_ENTITY:
          logger.info("TODO: Route to trust-ole page when story coded ");

          url += config.TRUST_TRUSTEE_LEGAL_ENTITY_URL;
          break;
        default:
          logger.info("TODO: On validation No trustee selected, re-displaying page");
    }

    return safeRedirect(res, url);
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
