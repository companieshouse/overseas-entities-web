import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';
import * as config from '../config';
import { TrusteeType } from '../model/trustee.type.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { validationResult } from 'express-validator/src/validation-result';
import { logger } from './logger';
import { safeRedirect } from './http.ext';
import { checkRelevantPeriod } from './relevant.period';
import { mapCommonTrustDataToPage } from './trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from './trust/who.is.involved.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { saveAndContinue } from './save.and.continue';
import { mapIndividualTrusteeFromSessionToPage } from '../utils/trust/individual.trustee.mapper';
import { mapFormerTrusteeFromSessionToPage } from '../utils/trust/historical.beneficial.owner.mapper';
import { isActiveFeature } from './feature.flag';
import { ApplicationData } from "../model";
import { updateOverseasEntity } from "../service/overseas.entities.service";

import { getUrlWithParamsToPath, isRegistrationJourney } from './url';
import { fetchApplicationData, setExtraData } from './application.data';
import { getTrustInReview, moveTrustOutOfReview } from './update/review_trusts';
import { getIndividualTrusteesFromTrust, getFormerTrusteesFromTrust } from './trusts';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { IndividualTrustee, TrustHistoricalBeneficialOwner } from '../model/trust.model';
import { CommonTrustData, TrustWhoIsInvolved, TrustWhoIsInvolvedForm } from '../model/trust.page.model';

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
  template: string;
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
    isUpdate: boolean,
    isReview: boolean,
    isRelevantPeriod: boolean
  } & TrustWhoIsInvolved,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = async (
  req: Request,
  isUpdate: boolean,
  isReview: boolean,
  formData?: TrustWhoIsInvolvedForm,
  errors?: FormattedValidationErrors,
): Promise<TrustInvolvedPageProperties> => {

  const isRegistration = isRegistrationJourney(req);
  const appData = await fetchApplicationData(req, isRegistration);
  let trustId;
  let individualTrusteeData;
  let formerTrusteeData;

  if (isReview) {
    const trustInReview = getTrustInReview(appData);
    trustId = trustInReview?.trust_id;
    individualTrusteeData = [
      ...getIndividualTrusteesFromTrust(appData, trustId, isReview)
        .map(mapIndividualTrusteeFromSessionToPage)
    ];
    formerTrusteeData = [
      ...getFormerTrusteesFromTrust(appData, trustId, isReview)
        .map(mapFormerTrusteeFromSessionToPage)
    ];

  } else {
    trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    individualTrusteeData = getIndividualTrusteesFromTrust(appData, trustId, isReview);
    formerTrusteeData = getFormerTrusteesFromTrust(appData, trustId, isReview);
  }

  const { templateName, template } = getPageTemplate(isUpdate, isReview, req.url);

  return {
    backLinkUrl: getBackLinkUrl(isUpdate, trustId, isReview, req),
    templateName,
    template,
    pageParams: {
      title: TRUST_INVOLVED_TEXTS.title,
    },
    pageData: {
      trustData: mapCommonTrustDataToPage(appData, trustId, isReview),
      ...mapTrustWhoIsInvolvedToPage(appData, trustId, isReview),
      beneficialOwnerTypeTitle: TRUST_INVOLVED_TEXTS.boTypeTitle,
      trusteeTypeTitle: TRUST_INVOLVED_TEXTS.trusteeTypeTitle,
      individualTrusteeData,
      formerTrusteeData,
      trusteeType: TrusteeType,
      checkYourAnswersUrl: getCheckYourAnswersUrl(isUpdate),
      beneficialOwnerUrlDetach: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_BENEFICIAL_OWNER_DETACH_URL}`,
      isUpdate,
      isReview,
      isRelevantPeriod: isUpdate ? checkRelevantPeriod(appData) : false,
    },
    formData,
    errors,
    url: getUrl(isUpdate),
  };
};

export const getTrustInvolvedPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean,
  isReview: boolean
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const pageProps = await getPageProperties(req, isUpdate, isReview);

    return res.render(pageProps.template, { ...pageProps, ...appData });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustInvolvedPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean,
  isReview: boolean
): Promise <void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.noMoreToAdd) {
      if (isReview) {
        const session = req.session as Session;
        const isRegistration = isRegistrationJourney(req);
        const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
        moveTrustOutOfReview(appData);

        appData?.trusts?.forEach(trust => {
          if (Array.isArray(trust.INDIVIDUALS)) {
            trust.INDIVIDUALS = trust.INDIVIDUALS.filter(ind => ind.forename);
          }
        });
        setExtraData(req.session, appData);
        if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
          await updateOverseasEntity(req, session, appData);
        } else {
          await saveAndContinue(req, session);
        }
      }
      return safeRedirect(res, getNextPage(isUpdate, isReview, req));
    }

    const errorList = validationResult(req); // check on errors

    if (!errorList.isEmpty()) {
      const pageProps = await getPageProperties(
        req,
        isUpdate,
        isReview,
        req.body,
        formatValidationError(errorList.array()),
      );
      return res.render(pageProps.template, pageProps);
    }

    const typeOfTrustee = req.body.typeOfTrustee;

    if (isReview) {
      switch (typeOfTrustee) {
          case TrusteeType.HISTORICAL:
            return safeRedirect(res, config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);
          case TrusteeType.INDIVIDUAL:
            return safeRedirect(res, config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);
          case TrusteeType.RELEVANT_PERIOD_INDIVIDUAL_BENEFICIARY:
            req.body.typeOfTrustee = TrusteeType.INDIVIDUAL;
            req.body.roleWithinTrustType = RoleWithinTrustType.BENEFICIARY;
            return safeRedirect(res, config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
          case TrusteeType.LEGAL_ENTITY:
            return safeRedirect(res, config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);
          case TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY:
            req.body.typeOfTrustee = TrusteeType.LEGAL_ENTITY;
            req.body.roleWithinTrustType = RoleWithinTrustType.BENEFICIARY;
            return safeRedirect(res, config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
          default:
            throw new Error("Unexpected trustee type received");
      }
    }

    // the req.params['id'] is already validated in the has.trust.middleware but sonar can not recognise this.
    let url = isUpdate
      ? `${config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`
      : `${getRegistrationTrustEntryUrl(req)}/${req.params[config.ROUTE_PARAM_TRUST_ID]}`;

    switch (typeOfTrustee) {
        case TrusteeType.HISTORICAL:
          url += config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;
          break;
        case TrusteeType.INDIVIDUAL:
          url += config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;
          break;
        case TrusteeType.RELEVANT_PERIOD_INDIVIDUAL_BENEFICIARY:
          req.body.typeOfTrustee = TrusteeType.INDIVIDUAL;
          req.body.roleWithinTrustType = RoleWithinTrustType.BENEFICIARY;
          url += config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
          break;
        case TrusteeType.LEGAL_ENTITY:
          url += config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;
          break;
        case TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY:
          req.body.typeOfTrustee = TrusteeType.LEGAL_ENTITY;
          url += config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
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

const getPageTemplate = (isUpdate: boolean, isReview: boolean, url: string) => {
  if (isReview) {
    return { template: config.UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE, templateName: config.UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE };
  } else if (isUpdate) {
    return { template: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE, templateName: url.replace(config.UPDATE_AN_OVERSEAS_ENTITY_URL, "") };
  } else {
    return { template: config.TRUST_INVOLVED_PAGE, templateName: config.TRUST_INVOLVED_PAGE, };
  }
};

const getBackLinkUrl = (isUpdate: boolean, trustId: string, isReview: boolean, req: Request) => {
  if (isReview) {
    return config.UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL;
  } else if (isUpdate) {
    let backLinkUrl = `${config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL}/${trustId}`;
    if (req.query["relevant-period"] === "true") {
      backLinkUrl += config.RELEVANT_PERIOD_QUERY_PARAM;
    }
    return backLinkUrl;
  } else {
    let backLinUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req)
      : config.TRUST_DETAILS_URL;
    backLinUrl += `/${trustId}`;
    return backLinUrl;
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

const getNextPage = (isUpdate: boolean, isReview: boolean, req: Request) => {
  if (isReview) {
    return config.UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL;
  }
  if (isUpdate) {
    return config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL;
  } else {
    let nextPageUrl = `${config.TRUST_ENTRY_URL + config.ADD_TRUST_URL}`;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      nextPageUrl = getUrlWithParamsToPath(`${config.TRUST_ENTRY_WITH_PARAMS_URL}${config.ADD_TRUST_URL}`, req);
    }
    return nextPageUrl;
  }
};

const getRegistrationTrustEntryUrl = (req: Request) => {
  let url = `${config.TRUST_ENTRY_URL}`;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    url = getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req);
  }
  return url;
};
