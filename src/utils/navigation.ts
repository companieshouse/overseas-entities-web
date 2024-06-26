import * as config from "../config";
import { Navigation } from "../model/navigation.model";
import { ApplicationData } from "../model/application.model";
import { WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { isActiveFeature } from "./feature.flag";
import { getUrlWithParamsToPath, isRemoveJourney } from "./url";
import { Request } from "express";

export const getEntityBackLink = (data: ApplicationData, req: Request): string => {
  let backLinkUrl: string = data?.who_is_registering === WhoIsRegisteringType.AGENT ? config.DUE_DILIGENCE_URL : config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = backLinkUrl === config.DUE_DILIGENCE_URL ? config.DUE_DILIGENCE_WITH_PARAMS_URL : config.OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL;
    return getUrlWithParamsToPath(backLinkUrl, req);
  }
  return backLinkUrl;
};

export const getSoldLandFilterBackLink = (): string => {
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
    return config.LANDING_PAGE_STARTING_NEW_URL;
  } else {
    return config.LANDING_PAGE_URL;
  }
};

export const getUpdateOrRemoveBackLink = async (req: Request, backLinkUrl: string): Promise<string> => {
  if (await isRemoveJourney(req)) {
    return `${backLinkUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
  } else {
    return backLinkUrl;
  }
};

export const getSecureUpdateFilterBackLink = async (req: Request): Promise<string> => {
  if (await isRemoveJourney(req)) {
    return `${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
  } else {
    return config.UPDATE_LANDING_PAGE_URL;
  }
};

export const getOverseasEntityPresenterBackLink = async (req: Request): Promise<string> => {
  if (await isRemoveJourney(req)) {
    return `${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
  } else {
    return config.UPDATE_FILING_DATE_URL;
  }
};

export const getUpdateReviewStatementBackLink = async (req: Request): Promise<string> => {
  if (await isRemoveJourney(req)) {
    return config.REMOVE_CONFIRM_STATEMENT_URL;
  }
  return config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL;
};

export const NAVIGATION: Navigation = {
  [config.STARTING_NEW_URL]: {
    currentPage: config.STARTING_NEW_PAGE,
    previousPage: () => config.LANDING_PAGE_URL,
    nextPage: [config.SOLD_LAND_FILTER_URL, config.YOUR_FILINGS_PATH]
  },
  [config.SOLD_LAND_FILTER_URL]: {
    currentPage: config.SOLD_LAND_FILTER_PAGE,
    previousPage: getSoldLandFilterBackLink,
    nextPage: [config.SECURE_REGISTER_FILTER_URL]
  },
  [config.SECURE_UPDATE_FILTER_URL]: {
    currentPage: config.SECURE_UPDATE_FILTER_PAGE,
    previousPage: async (appData: ApplicationData, req: Request) => await getSecureUpdateFilterBackLink(req),
    nextPage: [config.UPDATE_ANY_TRUSTS_INVOLVED_URL]
  },
  [config.UPDATE_INTERRUPT_CARD_URL]: {
    currentPage: config.UPDATE_INTERRUPT_CARD_PAGE,
    previousPage: () => config.UPDATE_ANY_TRUSTS_INVOLVED_URL,
    nextPage: [config.OVERSEAS_ENTITY_QUERY_PAGE]
  },
  [config.OVERSEAS_ENTITY_QUERY_URL]: {
    currentPage: config.OVERSEAS_ENTITY_QUERY_PAGE,
    previousPage: async (appData: ApplicationData, req: Request) => await getUpdateOrRemoveBackLink(req, config.UPDATE_INTERRUPT_CARD_URL),
    nextPage: [config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE]
  },
  [config.UPDATE_FILING_DATE_URL]: {
    currentPage: config.UPDATE_FILING_DATE_PAGE,
    previousPage: () => config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
    nextPage: [config.UPDATE_PRESENTER_PAGE]
  },
  [config.OVERSEAS_ENTITY_PRESENTER_URL]: {
    currentPage: config.UPDATE_PRESENTER_PAGE,
    previousPage:async (appData: ApplicationData, req: Request) => await getOverseasEntityPresenterBackLink(req),
    nextPage: [config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE]
  },
  [config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL]: {
    currentPage: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
    previousPage: () => config.OVERSEAS_ENTITY_PRESENTER_URL,
    nextPage: [config.WHO_IS_MAKING_UPDATE_URL, config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE]
  },
  [config.UPDATE_REVIEW_STATEMENT_URL]: {
    currentPage: config.UPDATE_REVIEW_STATEMENT_PAGE,
    previousPage: async (appData: ApplicationData, req: Request) => await getUpdateReviewStatementBackLink(req),
    nextPage: [config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, config.OVERSEAS_ENTITY_PAYMENT_WITH_TRANSACTION_URL]
  },
  [config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL]: {
    currentPage: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
    previousPage: async (appData: ApplicationData, req: Request) => await getUpdateOrRemoveBackLink(req, config.OVERSEAS_ENTITY_QUERY_URL),
    nextPage: [config.UPDATE_FILING_DATE_PAGE, config.PRESENTER_URL, config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE]
  },
  [config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL]: {
    currentPage: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE,
    previousPage: () => config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
    nextPage: [config.RELEVANT_PERIOD_INTERRUPT_PAGE]
  },
  [config.RELEVANT_PERIOD_INTERRUPT_URL]: {
    currentPage: config.RELEVANT_PERIOD_INTERRUPT_PAGE,
    previousPage: () => config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL,
    nextPage: [config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE]
  },
  [config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL]: {
    currentPage: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE,
    previousPage: () => config.RELEVANT_PERIOD_INTERRUPT_URL,
    nextPage: [config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL]
  },
  [config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL]: {
    currentPage: config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE,
    previousPage: () => config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL,
    nextPage: [config.UPDATE_FILING_DATE_URL]
  },
  [config.WHO_IS_MAKING_UPDATE_URL]: {
    currentPage: config.WHO_IS_MAKING_UPDATE_PAGE,
    previousPage: () => config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
    nextPage: [config.UPDATE_DUE_DILIGENCE_PAGE, config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE]
  },
  [config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL]: {
    currentPage: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
    previousPage: () => config.WHO_IS_MAKING_UPDATE_PAGE,
    nextPage: [config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL]
  },
  [config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL]: {
    currentPage: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
    previousPage: () => config.WHO_IS_MAKING_UPDATE_PAGE,
    nextPage: [config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
    previousPage: () => config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_CHECK_YOUR_ANSWERS_URL]
  },
  [config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL]: {
    currentPage: config.ENTITY_PAGE,
    previousPage: () => config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL]
  },
  [config.UPDATE_CHECK_YOUR_ANSWERS_URL]: {
    currentPage: config.UPDATE_CHECK_YOUR_ANSWERS_PAGE,
    previousPage: () => config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
    nextPage: []
  },
  [config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL]: {
    currentPage: config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previousPage: () => config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
    nextPage: [config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previousPage: () => config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
    nextPage: [config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]
  },
  [config.SECURE_REGISTER_FILTER_URL]: {
    currentPage: config.SECURE_REGISTER_FILTER_PAGE,
    previousPage: () => config.SOLD_LAND_FILTER_URL,
    nextPage: [config.INTERRUPT_CARD_URL]
  },
  [config.INTERRUPT_CARD_URL]: {
    currentPage: config.INTERRUPT_CARD_PAGE,
    previousPage: () => config.SECURE_REGISTER_FILTER_URL,
    nextPage: [config.OVERSEAS_NAME_URL]
  },
  [config.OVERSEAS_NAME_URL]: {
    currentPage: config.OVERSEAS_NAME_PAGE,
    previousPage: () => config.INTERRUPT_CARD_URL,
    nextPage: [config.PRESENTER_URL]
  },
  [config.OVERSEAS_NAME_WITH_PARAMS_URL]: {
    currentPage: config.OVERSEAS_NAME_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.INTERRUPT_CARD_WITH_PARAMS_URL, req),
    nextPage: [config.PRESENTER_URL]
  },
  [config.PRESENTER_URL]: {
    currentPage: config.PRESENTER_PAGE,
    previousPage: () => config.OVERSEAS_NAME_URL,
    nextPage: [config.WHO_IS_MAKING_FILING_URL]
  },
  [config.PRESENTER_WITH_PARAMS_URL]: {
    currentPage: config.PRESENTER_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.OVERSEAS_NAME_WITH_PARAMS_URL, req),
    nextPage: [config.WHO_IS_MAKING_FILING_URL]
  },
  [config.WHO_IS_MAKING_FILING_URL]: {
    currentPage: config.WHO_IS_MAKING_FILING_PAGE,
    previousPage: () => config.PRESENTER_URL,
    nextPage: [config.DUE_DILIGENCE_URL, config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL]
  },
  [config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL]: {
    currentPage: config.WHO_IS_MAKING_FILING_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.PRESENTER_WITH_PARAMS_URL, req),
    nextPage: [config.DUE_DILIGENCE_URL, config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL]
  },
  [config.DUE_DILIGENCE_URL]: {
    currentPage: config.DUE_DILIGENCE_PAGE,
    previousPage: () => config.WHO_IS_MAKING_FILING_URL,
    nextPage: [config.ENTITY_URL]
  },
  [config.DUE_DILIGENCE_WITH_PARAMS_URL]: {
    currentPage: config.DUE_DILIGENCE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req),
    nextPage: [config.ENTITY_URL]
  },
  [config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL]: {
    currentPage: config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
    previousPage: () => config.WHO_IS_MAKING_FILING_URL,
    nextPage: [config.ENTITY_URL]
  },
  [config.OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL]: {
    currentPage: config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req),
    nextPage: [config.ENTITY_URL]
  },
  [config.ENTITY_URL]: {
    currentPage: config.ENTITY_PAGE,
    previousPage: getEntityBackLink,
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL]
  },
  [config.ENTITY_WITH_PARAMS_URL]: {
    currentPage: config.ENTITY_PAGE,
    previousPage: getEntityBackLink,
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL]
  },
  [config.BENEFICIAL_OWNER_STATEMENTS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previousPage: () => config.ENTITY_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.ENTITY_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_DELETE_WARNING_URL]: {
    currentPage: config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL, config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_DELETE_WARNING_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL, config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_TYPE_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL, config.TRUST_INFO_URL]
  },
  [config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req),
    nextPage: [config.CHECK_YOUR_ANSWERS_URL, config.TRUST_INFO_URL]
  },
  [config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL, config.TRUST_INFO_URL]
  },
  [config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req),
    nextPage: [config.CHECK_YOUR_ANSWERS_URL, config.TRUST_INFO_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_URL]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_URL]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_URL]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_URL]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_WITH_PARAMS_URL]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_URL]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_WITH_PARAMS_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: (appData: ApplicationData, req: Request) => getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL]: {
    currentPage: config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL_WITH_PARAM_URL]: {
    currentPage: config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL]: {
    currentPage: config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URLWITH_PARAM_URL]: {
    currentPage: config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.TRUST_INFO_URL]: {
    currentPage: config.TRUST_INFO_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL]
  },
  [config.TRUST_INFO_WITH_PARAMS_URL]: {
    currentPage: config.TRUST_INFO_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL]
  },
  [config.SIGN_OUT_URL]: {
    currentPage: config.SIGN_OUT_PAGE,
    previousPage: () => "",
    nextPage: []
  },
  [config.SIGN_OUT_WITH_PARAMS_URL]: {
    currentPage: config.SIGN_OUT_PAGE,
    previousPage: () => "",
    nextPage: []
  },
  [config.UPDATE_DUE_DILIGENCE_URL]: {
    currentPage: config.UPDATE_DUE_DILIGENCE_PAGE,
    previousPage: () => config.WHO_IS_MAKING_UPDATE_URL,
    nextPage: [config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_GOV_URL]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL_WITH_PARAM_URL]: {
    currentPage: config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_OTHER_URL]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.ID]: {
    currentPage: config.UPDATE_BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_CONFIRM_TO_REMOVE_URL + config.ROUTE_PARAM_BO_MO_TYPE + config.ID]: {
    currentPage: config.UPDATE_CONFIRM_TO_REMOVE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL]
  },
  [config.UPDATE_MANAGING_OFFICER_URL]: {
    currentPage: config.UPDATE_MANAGING_OFFICER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_MANAGING_OFFICER_URL + config.ID]: {
    currentPage: config.UPDATE_MANAGING_OFFICER_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_MANAGING_OFFICER_CORPORATE_URL]: {
    currentPage: config.UPDATE_MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_MANAGING_OFFICER_CORPORATE_URL + config.ID]: {
    currentPage: config.UPDATE_MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]: {
    currentPage: config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
    previousPage: () => config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
    nextPage: [config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL]
  },
  [config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL]: {
    currentPage: config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
    previousPage: () => config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.UPDATE_REVIEW_STATEMENT_URL]
  },
  [config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL]: {
    currentPage: config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE,
    previousPage: () => config.SECURE_UPDATE_FILTER_PAGE,
    nextPage: [config.YOUR_FILINGS_PATH]
  },
  [config.UPDATE_SIGN_OUT_URL]: {
    currentPage: config.UPDATE_SIGN_OUT_PAGE,
    previousPage: () => "",
    nextPage: []
  },
  [config.UPDATE_ANY_TRUSTS_INVOLVED_URL]: {
    currentPage: config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE,
    previousPage: () => config.SECURE_UPDATE_FILTER_URL,
    nextPage: [config.UPDATE_INTERRUPT_CARD_URL]
  },
  [config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL]: {
    currentPage: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE,
    previousPage: () => config.UPDATE_ANY_TRUSTS_INVOLVED_URL,
    nextPage: [config.UPDATE_ANY_TRUSTS_INVOLVED_URL]
  },
  [config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL]: {
    currentPage: config.UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE,
    previousPage: (appData?: ApplicationData) => appData?.update?.no_change
      ? config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL
      : config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [
      config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
      config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
      config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
    ],
  },
  [config.REMOVE_SOLD_ALL_LAND_FILTER_URL]: {
    currentPage: config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE,
    previousPage: () => `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    nextPage: [config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL]
  },
  [config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL]: {
    currentPage: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE,
    previousPage: () => `${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    nextPage: [`${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`]
  },
  [config.REMOVE_CONFIRM_STATEMENT_URL]: {
    currentPage: config.REMOVE_CONFIRM_STATEMENT_PAGE,
    previousPage: () => `${config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL}`,
    nextPage: [`${config.REMOVE_CANNOT_USE_URL}`]
  }
};
