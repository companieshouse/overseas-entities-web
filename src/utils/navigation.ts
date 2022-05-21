import * as config from "../config";
import { Navigation } from "../model/navigation.model";

export const NAVIGATION: Navigation = {
  [config.PRESENTER_URL]: {
    currentPage: config.PRESENTER_PAGE,
    previusPage: config.LANDING_URL,
    nextPage: config.ENTITY_URL
  },
  [config.ENTITY_URL]: {
    currentPage: config.ENTITY_PAGE,
    previusPage: config.PRESENTER_URL,
    nextPage: config.BENEFICIAL_OWNER_STATEMENTS_URL
  },
  [config.BENEFICIAL_OWNER_STATEMENTS_URL]: {
    currentPage: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
    previusPage: config.ENTITY_URL,
    nextPage: config.BENEFICIAL_OWNER_TYPE_URL
  },
  [config.BENEFICIAL_OWNER_TYPE_URL]: {
    currentPage: config.BENEFICIAL_OWNER_TYPE_PAGE,
    previusPage: config.BENEFICIAL_OWNER_STATEMENTS_URL,
    nextPage: config.CHECK_YOUR_ANSWERS_URL
  },
  [config.MANAGING_OFFICER_URL]: {
    currentPage: config.MANAGING_OFFICER_PAGE,
    previusPage: config.BENEFICIAL_OWNER_TYPE_URL,
    nextPage: config.BENEFICIAL_OWNER_TYPE_URL
  }
};
