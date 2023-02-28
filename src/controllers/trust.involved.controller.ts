import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { TrusteeType } from '../model/trustee.type.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { CommonTrustData, TrustWhoIsInvolved, TrustWhoIsInvolvedForm } from '../model/trust.page.model';
import { validationResult } from 'express-validator/src/validation-result';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { getApplicationData } from '../utils/application.data';
import { mapCommonTrustDataToPage } from '../utils/trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from '../utils/trust/who.is.involved.mapper';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { IndividualTrustee, TrustHistoricalBeneficialOwner } from '../model/trust.model';
import { getIndividualTrusteesFromTrust, getFormerTrusteesFromTrust } from '../utils/trusts';

const TRUST_INVOLVED_TEXTS = {
  title: 'Individuals or entities involved in the trust',
  boTypeTitle: {
    [BeneficialOwnerTypeChoice.individual]: 'Individual beneficial owner',
    [BeneficialOwnerTypeChoice.otherLegal]: 'Other legal beneficial owner',
  },
  trusteeTypeTitle: {
    [TrusteeType.HISTORICAL]: 'Former beneficial owner',
    [TrusteeType.INDIVIDUAL]: 'Individual',
    [TrusteeType.LEGAL_ENTITY]: 'Legal entity',
  },
};

type TrustInvolvedPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
  },
  pageData: {
    beneficialOwnerTypeTitle: Record<string, string>;
    trusteeTypeTitle: Record<string, string>;
    trusteeType: typeof TrusteeType;
    individualTrusteeData: IndividualTrustee[];
    formerTrusteeData: TrustHistoricalBeneficialOwner[];
    checkYourAnswersUrl: string;
    beneficialOwnerUrlDetach: string;
    trustData: CommonTrustData,
  } & TrustWhoIsInvolved,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
};

const getPageProperties = (
  req: Request,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
): TrustInvolvedPageProperties => {
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

  const appData = getApplicationData(req.session);

  return {
    backLinkUrl: `${config.TRUST_DETAILS_URL}/${trustId}`,
    templateName: config.TRUST_INVOLVED_PAGE,
    pageParams: {
      title: TRUST_INVOLVED_TEXTS.title,
    },
    pageData: {
      trustData: mapCommonTrustDataToPage(appData, trustId),
      ...mapTrustWhoIsInvolvedToPage(appData, trustId),
      beneficialOwnerTypeTitle: TRUST_INVOLVED_TEXTS.boTypeTitle,
      trusteeTypeTitle: TRUST_INVOLVED_TEXTS.trusteeTypeTitle,
      individualTrusteeData: getIndividualTrusteesFromTrust(appData, trustId),
      formerTrusteeData: getFormerTrusteesFromTrust(appData, trustId),
      trusteeType: TrusteeType,
      checkYourAnswersUrl: config.CHECK_YOUR_ANSWERS_URL,
      beneficialOwnerUrlDetach: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_BENEFICIAL_OWNER_DETACH_URL}`,
    },
    formData,
    errors,
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

    if (req.body.noMoreToAdd) {
      return safeRedirect(res, `${config.TRUST_ENTRY_URL + "/" + trustId + config.ADD_TRUST_URL}`);
    }
    //  check on errors
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        req.body,
        formatValidationError(errorList.array()),
      );

      return res.render(pageProps.templateName, pageProps);
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
          url += config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;
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
