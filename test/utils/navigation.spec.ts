jest.mock('../../src/utils/feature.flag');

import { describe, expect, jest, test } from '@jest/globals';

import * as config from "../../src/config";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../../src/model/who.is.making.filing.model';

import { NAVIGATION, getEntityBackLink, getSoldLandFilterBackLink } from "../../src/utils/navigation";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("NAVIGATION utils", () => {

  test(`getEntityBackLink returns ${config.DUE_DILIGENCE_URL} when ${WhoIsRegisteringType.AGENT} selected`, () => {
    const entityBackLink = getEntityBackLink({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
    expect(entityBackLink).toEqual(config.DUE_DILIGENCE_URL);
  });

  test(`getEntityBackLink returns ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL} when ${WhoIsRegisteringType.SOMEONE_ELSE} selected`, () => {
    const entityBackLink = getEntityBackLink({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });
    expect(entityBackLink).toEqual(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
  });

  test(`getSoldLandFilterBackLink returns ${config.LANDING_PAGE_STARTING_NEW_URL} when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is active`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const soldLandFilterBackLink = getSoldLandFilterBackLink();
    expect(soldLandFilterBackLink).toEqual(config.LANDING_PAGE_STARTING_NEW_URL);
  });

  test(`getSoldLandFilterBackLink returns ${config.LANDING_PAGE_URL} when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is not active`, () => {
    const soldLandFilterBackLink = getSoldLandFilterBackLink();
    expect(soldLandFilterBackLink).toEqual(config.LANDING_PAGE_URL);
  });

  test(`NAVIGATION returns ${config.LANDING_PAGE_URL} when calling previousPage on ${config.STARTING_NEW_URL} object`, () => {
    const navigation = NAVIGATION[config.STARTING_NEW_URL].previousPage();
    expect(navigation).toEqual(config.LANDING_PAGE_URL);
  });

  test(`NAVIGATION returns ${config.LANDING_PAGE_URL} when calling previousPage on ${config.SOLD_LAND_FILTER_URL} object`, () => {
    const navigation = NAVIGATION[config.SOLD_LAND_FILTER_URL].previousPage();
    expect(navigation).toEqual(config.LANDING_PAGE_URL);
  });

  test(`NAVIGATION returns ${config.SOLD_LAND_FILTER_URL} when calling previousPage on ${config.SECURE_REGISTER_FILTER_URL} object`, () => {
    const navigation = NAVIGATION[config.SECURE_REGISTER_FILTER_URL].previousPage();
    expect(navigation).toEqual(config.SOLD_LAND_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.SECURE_REGISTER_FILTER_URL} when calling previousPage on ${config.INTERRUPT_CARD_URL} object`, () => {
    const navigation = NAVIGATION[config.INTERRUPT_CARD_URL].previousPage();
    expect(navigation).toEqual(config.SECURE_REGISTER_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.INTERRUPT_CARD_URL} when calling previousPage on ${config.OVERSEAS_NAME_URL} object`, () => {
    const navigation = NAVIGATION[config.OVERSEAS_NAME_URL].previousPage();
    expect(navigation).toEqual(config.INTERRUPT_CARD_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_NAME_URL} when calling previousPage on ${config.PRESENTER_URL} object`, () => {
    const navigation = NAVIGATION[config.PRESENTER_URL].previousPage();
    expect(navigation).toEqual(config.OVERSEAS_NAME_URL);
  });

  test(`NAVIGATION returns ${config.PRESENTER_URL} when calling previousPage on ${config.WHO_IS_MAKING_FILING_URL} object`, () => {
    const navigation = NAVIGATION[config.WHO_IS_MAKING_FILING_URL].previousPage();
    expect(navigation).toEqual(config.PRESENTER_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_URL} when calling previousPage on ${config.DUE_DILIGENCE_URL} object`, () => {
    const navigation = NAVIGATION[config.DUE_DILIGENCE_URL].previousPage();
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL} object`, () => {
    const navigation = NAVIGATION[config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL].previousPage();
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_URL);
  });

  test(`NAVIGATION returns ${config.ENTITY_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_STATEMENTS_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_STATEMENTS_URL].previousPage();
    expect(navigation).toEqual(config.ENTITY_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_DELETE_WARNING_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_DELETE_WARNING_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_TYPE_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_TYPE_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_OTHER_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_URL} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_GOV_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_URL} object`, () => {
    const navigation = NAVIGATION[config.MANAGING_OFFICER_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_URL} object`, () => {
    const navigation = NAVIGATION[config.MANAGING_OFFICER_CORPORATE_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_OTHER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.BENEFICIAL_OWNER_GOV_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.MANAGING_OFFICER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.MANAGING_OFFICER_CORPORATE_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.TRUST_INFO_URL} object`, () => {
    const navigation = NAVIGATION[config.TRUST_INFO_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  // Update Journey
  test(`NAVIGATION returns ${config.SECURE_UPDATE_FILTER_URL} when calling previousPage on ${config.UPDATE_INTERRUPT_CARD_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_INTERRUPT_CARD_URL].previousPage();
    expect(navigation).toEqual(config.SECURE_UPDATE_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_FILING_DATE_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_PRESENTER_URL} object`, () => {
    const navigation = NAVIGATION[config.OVERSEAS_ENTITY_PRESENTER_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_FILING_DATE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} when calling previousPage on ${config.UPDATE_FILING_DATE_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_FILING_DATE_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_ENTITY_QUERY_URL} when calling previousPage on ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL].previousPage();
    expect(navigation).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_INTERRUPT_CARD_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_QUERY_URL} object`, () => {
    const navigation = NAVIGATION[config.OVERSEAS_ENTITY_QUERY_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_INTERRUPT_CARD_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_OTHER_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_OTHER_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_OTHER_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_OTHER_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_GOV_URL} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_GOV_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID} object`, () => {
    const navigation = NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`Navigation returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL}`, () => {
    const navigation = NAVIGATION[config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });
});
