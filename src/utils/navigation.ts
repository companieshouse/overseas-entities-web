import * as config from "../config";
import { Navigation } from "../model/navigation.model";
import { ApplicationData } from "../model/application.model";
import { WhoIsRegisteringType } from "../model/who.is.making.filing.model";

export const getEntityBackLink = (data: ApplicationData): string => {
  return data?.who_is_registering === WhoIsRegisteringType.AGENT
    ? config.DUE_DILIGENCE_URL
    : config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL;
};

export const NAVIGATION: Navigation = {
  [config.SOLD_LAND_FILTER_URL]: {
    currentPage: config.SOLD_LAND_FILTER_PAGE,
    previousPage: () => config.LANDING_PAGE_URL,
    nextPage: [config.SECURE_REGISTER_FILTER_URL]
  },
  [config.OVERSEAS_ENTITY_QUERY_URL]: {
    currentPage: config.OVERSEAS_ENTITY_QUERY_PAGE,
    previousPage: () => config.UPDATE_LANDING_PAGE_URL,
    nextPage: [config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE]
  },
  [config.SECURE_REGISTER_FILTER_URL]: {
    currentPage: config.SECURE_REGISTER_FILTER_PAGE,
    previousPage: () => config.SOLD_LAND_FILTER_URL,
    nextPage: [config.INTERRUPT_CARD_URL]
  },
  [config.INTERRUPT_CARD_URL]: {
    currentPage: config.INTERRUPT_CARD_PAGE,
    previousPage: () => config.SECURE_REGISTER_FILTER_URL,
    nextPage: [config.PRESENTER_URL]
  },
  [config.PRESENTER_URL]: {
    currentPage: config.PRESENTER_PAGE,
    previousPage: () => config.INTERRUPT_CARD_URL,
    nextPage: [config.WHO_IS_MAKING_FILING_URL]
  },
  [config.WHO_IS_MAKING_FILING_URL]: {
    currentPage: config.WHO_IS_MAKING_FILING_PAGE,
    previousPage: () => config.PRESENTER_URL,
    nextPage: [config.DUE_DILIGENCE_URL, config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL]
  },
  [config.DUE_DILIGENCE_URL]: {
    currentPage: config.DUE_DILIGENCE_PAGE,
    previousPage: () => config.WHO_IS_MAKING_FILING_URL,
    nextPage: [config.ENTITY_URL]
  },
  [config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL]: {
    currentPage: config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
    previousPage: () => config.WHO_IS_MAKING_FILING_URL,
    nextPage: [config.ENTITY_URL]
  },
  [config.ENTITY_URL]: {
    currentPage: config.ENTITY_PAGE,
    previousPage: getEntityBackLink,
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL]
  },
  [config.BENEFICIAL_OWNER_STATEMENTS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previousPage: () => config.ENTITY_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_DELETE_WARNING_URL]: {
    currentPage: config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.BENEFICIAL_OWNER_STATEMENTS_URL, config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_TYPE_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL, config.TRUST_INFO_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_URL]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_URL]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_URL]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_URL]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_URL]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_OTHER_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_OTHER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.BENEFICIAL_OWNER_GOV_URL + config.ID]: {
    currentPage: config.BENEFICIAL_OWNER_GOV_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.MANAGING_OFFICER_CORPORATE_URL + config.ID]: {
    currentPage: config.MANAGING_OFFICER_CORPORATE_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.BENEFICIAL_OWNER_TYPE_URL]
  },
  [config.TRUST_INFO_URL]: {
    currentPage: config.TRUST_INFO_PAGE,
    previousPage: () => config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: [config.CHECK_YOUR_ANSWERS_URL]
  },
  [config.SIGN_OUT_URL]: {
    currentPage: config.SIGN_OUT_PAGE,
    previousPage: () => "",
    nextPage: []
  }
};
