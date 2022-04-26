import * as config from "../config";
import { Navigation } from "../model/navigation.model";

export const NAVIGATION: Navigation = {
  [config.ENTITY_URL]: {
    currentPage: config.ENTITY_PAGE,
    previusPage: config.PRESENTER_URL,
    nextPage: config.BENEFICIAL_OWNER_STATEMENTS_URL
  },
  [config.BENEFICIAL_OWNER_INDIVIDUAL_URL]: {
    currentPage: config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    previusPage: config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: config.BENEFICIAL_OWNER_TYPE_URL
  },
  [config.MANAGING_OFFICER_URL]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previusPage: config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: config.BENEFICIAL_OWNER_TYPE_URL
  }
};
