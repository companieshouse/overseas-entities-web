import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { TrusteeType } from '../model/trustee.type.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { CommonTrustData, TrustWhoIsInvolved, TrustWhoIsInvolvedForm } from '../model/trust.page.model';
import { validationResult } from 'express-validator/src/validation-result';
import { logger } from './logger';
import { safeRedirect } from './http.ext';
import { getApplicationData } from './application.data';
import { mapCommonTrustDataToPage } from './trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from './trust/who.is.involved.mapper';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { IndividualTrustee, TrustHistoricalBeneficialOwner } from '../model/trust.model';
import { getIndividualTrusteesFromTrust, getFormerTrusteesFromTrust } from './trusts';

export const TRUST_INVOLVED_TEXTS = {
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
    isUpdate: boolean
  } & TrustWhoIsInvolved,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = (
  req: Request,
  isUpdate: boolean,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
): TrustInvolvedPageProperties => {

  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
  const appData = getApplicationData(req.session);

  return {
    backLinkUrl: getBackLinkUrl(isUpdate, trustId),
    templateName: getPageTemplate(isUpdate),
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
      checkYourAnswersUrl: getCheckYourAnswersUrl(isUpdate),
      beneficialOwnerUrlDetach: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_BENEFICIAL_OWNER_DETACH_URL}`,
      isUpdate: isUpdate
    },
    formData,
    errors,
    url: getUrl(isUpdate),
  };
};

export const getTrustInvolvedPage = (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties(req, isUpdate);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustInvolvedPage = (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.noMoreToAdd) {
      return safeRedirect(res, getNextPage(isUpdate));
    }
    //  check on errors
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        isUpdate,
        req.body,
        formatValidationError(errorList.array()),
      );

      return res.render(pageProps.templateName, pageProps);
    }

    const typeOfTrustee = req.body.typeOfTrustee;

    // the req.params['id'] is already validated in the has.trust.middleware but sonar can not recognise this.
    let url = isUpdate
      ? `${config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`
      : `${config.TRUST_ENTRY_URL}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`;

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

const getPageTemplate = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE;
  } else {
    return config.TRUST_INVOLVED_PAGE;
  }
};

const getBackLinkUrl = (isUpdate: boolean, trustId: string) => {
  if (isUpdate) {
    return `${config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL}/${trustId}`;
  } else {
    return `${config.TRUST_DETAILS_URL}/${trustId}`;
  }
};

const getCheckYourAnswersUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_CHECK_YOUR_ANSWERS_URL;
  } else {
    return config.CHECK_YOUR_ANSWERS_URL;
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};

const getNextPage = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL;
  } else {
    return `${config.TRUST_ENTRY_URL + config.ADD_TRUST_URL}`;
  }
};