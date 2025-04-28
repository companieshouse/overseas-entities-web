jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/update/no.change.journey');

import { Request } from "express";
import * as config from "../../src/config";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getApplicationData } from "../../src/utils/application.data";
import { isNoChangeJourney } from "../../src/utils/update/no.change.journey";

import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../../src/model/who.is.making.filing.model';

import {
  NAVIGATION,
  getEntityBackLink,
  getSoldLandFilterBackLink,
  getUpdateOrRemoveBackLink,
  getSecureUpdateFilterBackLink,
  getOverseasEntityPresenterBackLink,
  getUpdateReviewStatementBackLink
} from "../../src/utils/navigation";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockIsNoChangeJourney = isNoChangeJourney as jest.Mock;

const mockRemoveRequest = { } as Request;
mockRemoveRequest["query"] = {
  "journey": "remove"
};

const mockRequestWithParams = {
  params: {
    transactionId: `:${config.ROUTE_PARAM_TRANSACTION_ID}`,
    submissionId: `:${config.ROUTE_PARAM_SUBMISSION_ID}`
  }
} as any;

describe("NAVIGATION utils", () => {

  test(`getEntityBackLink returns ${config.DUE_DILIGENCE_URL} when ${WhoIsRegisteringType.AGENT} selected`, () => {
    const mockRequest = { query: {} } as Request;
    const entityBackLink = getEntityBackLink({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT }, mockRequest);
    expect(entityBackLink).toEqual(config.DUE_DILIGENCE_URL);
  });

  test(`getEntityBackLink returns ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL} when ${WhoIsRegisteringType.SOMEONE_ELSE} selected`, () => {
    const mockRequest = { query: {} } as Request;
    const entityBackLink = getEntityBackLink({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE }, mockRequest);
    expect(entityBackLink).toEqual(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
  });

  test(`getSoldLandFilterBackLink returns ${config.LANDING_PAGE_STARTING_NEW_URL}`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const soldLandFilterBackLink = getSoldLandFilterBackLink();
    expect(soldLandFilterBackLink).toEqual(config.LANDING_PAGE_STARTING_NEW_URL);
  });

  test(`getRemoveBackLink returns a URL with the 'journey' query parameter present when on the Remove journey`, async () => {
    const removeBackLink = await getUpdateOrRemoveBackLink(mockRemoveRequest, config.UPDATE_LANDING_PAGE_URL);
    expect(removeBackLink).toEqual(`${config.UPDATE_LANDING_PAGE_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`getSecureUpdateFilterBackLink returns the correct URL with the 'journey' query parameter present when on the Remove journey`, async () => {
    const backLink = await getSecureUpdateFilterBackLink(mockRemoveRequest);
    expect(backLink).toEqual(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`getSecureUpdateFilterBackLink returns the correct URL when not on the Remove journey`, async () => {
    const mockRequest = { query: {} } as Request;
    const backLink = await getSecureUpdateFilterBackLink(mockRequest);
    expect(backLink).toEqual(config.UPDATE_LANDING_PAGE_URL);
  });

  test(`getOverseasEntityPresenterBackLink returns the correct URL with the 'journey' query parameter present when on the Remove journey`, async () => {
    const backLink = await getOverseasEntityPresenterBackLink(mockRemoveRequest);
    expect(backLink).toEqual(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`getOverseasEntityPresenterBackLink returns the correct URL when not on the Remove journey`, async () => {
    const mockRequest = { query: {} } as Request;
    const backLink = await getOverseasEntityPresenterBackLink(mockRequest);
    expect(backLink).toEqual(config.UPDATE_FILING_DATE_URL);
  });

  test(`getUpdateReviewStatementBackLink returns the correct URL when not on the Remove journey`, async () => {
    const mockRequest = { query: {} } as Request;
    const backLink = await getUpdateReviewStatementBackLink(mockRequest);
    expect(backLink).toEqual(config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
  });

  test(`getUpdateReviewStatementBackLink returns the correct URL when on the Remove journey`, async () => {
    const backLink = await getUpdateReviewStatementBackLink(mockRemoveRequest);
    expect(backLink).toEqual(config.REMOVE_CONFIRM_STATEMENT_URL);
  });

  test(`NAVIGATION returns ${config.LANDING_PAGE_URL} when calling previousPage on ${config.STARTING_NEW_URL} object`, async () => {
    const navigation = await NAVIGATION[config.STARTING_NEW_URL].previousPage();
    expect(navigation).toEqual(config.LANDING_PAGE_URL);
  });

  test(`NAVIGATION returns ${config.SOLD_LAND_FILTER_URL} when calling previousPage on ${config.SECURE_REGISTER_FILTER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.SECURE_REGISTER_FILTER_URL].previousPage();
    expect(navigation).toEqual(config.SOLD_LAND_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.SOLD_LAND_FILTER_WITH_PARAMS_URL} when calling previousPage on ${config.SECURE_REGISTER_FILTER_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.SECURE_REGISTER_FILTER_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.SOLD_LAND_FILTER_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.SECURE_REGISTER_FILTER_URL} when calling previousPage on ${config.INTERRUPT_CARD_URL} object`, async () => {
    const navigation = await NAVIGATION[config.INTERRUPT_CARD_URL].previousPage();
    expect(navigation).toEqual(config.SECURE_REGISTER_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.INTERRUPT_CARD_URL} when calling previousPage on ${config.OVERSEAS_NAME_URL} object`, async () => {
    const navigation = await NAVIGATION[config.OVERSEAS_NAME_URL].previousPage();
    expect(navigation).toEqual(config.INTERRUPT_CARD_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_NAME_URL} when calling previousPage on ${config.PRESENTER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.PRESENTER_URL].previousPage();
    expect(navigation).toEqual(config.OVERSEAS_NAME_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_NAME_WITH_PARAMS_URL} when calling previousPage on ${config.PRESENTER_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.PRESENTER_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.OVERSEAS_NAME_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.PRESENTER_URL} when calling previousPage on ${config.WHO_IS_MAKING_FILING_URL} object`, async () => {
    const navigation = await NAVIGATION[config.WHO_IS_MAKING_FILING_URL].previousPage();
    expect(navigation).toEqual(config.PRESENTER_URL);
  });

  test(`NAVIGATION returns ${config.PRESENTER_WITH_PARAMS_URL} when calling previousPage on ${config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.PRESENTER_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_URL} when calling previousPage on ${config.DUE_DILIGENCE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.DUE_DILIGENCE_URL].previousPage();
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL} when calling previousPage on ${config.DUE_DILIGENCE_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.DUE_DILIGENCE_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL].previousPage();
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.ENTITY_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_STATEMENTS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_STATEMENTS_URL].previousPage();
    expect(navigation).toEqual(config.ENTITY_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_DELETE_WARNING_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_DELETE_WARNING_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_DELETE_WARNING_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_DELETE_WARNING_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_TYPE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_TYPE_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_OTHER_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_GOV_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.MANAGING_OFFICER_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_CORPORATE_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + config.ID].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_OTHER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL + config.ID].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_GOV_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.ID].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.MANAGING_OFFICER_WITH_PARAMS_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_WITH_PARAMS_URL + config.ID].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_CORPORATE_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL + config.ID].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.TRUST_INFO_URL} object`, async () => {
    const navigation = await NAVIGATION[config.TRUST_INFO_URL].previousPage();
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} when calling previousPage on ${config.TRUST_INFO_WITH_PARAMS_URL} object`, async () => {
    const navigation = await NAVIGATION[config.TRUST_INFO_WITH_PARAMS_URL].previousPage(mockGetApplicationData(), mockRequestWithParams);
    expect(navigation).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
  });

  // Update Journey
  test(`NAVIGATION returns ${config.SECURE_UPDATE_FILTER_URL} when calling previousPage on ${config.UPDATE_ANY_TRUSTS_INVOLVED_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_ANY_TRUSTS_INVOLVED_URL].previousPage();
    expect(navigation).toEqual(config.SECURE_UPDATE_FILTER_URL);
  });

  test(`NAVIGATION returns ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL} with 'journey' param set when calling previousPage on ${config.SECURE_UPDATE_FILTER_URL} object for Remove journey`, async () => {
    const navigation = await NAVIGATION[config.SECURE_UPDATE_FILTER_URL].previousPage(undefined, mockRemoveRequest);
    expect(navigation).toEqual(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`NAVIGATION returns ${config.UPDATE_FILING_DATE_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_PRESENTER_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_PRESENTER_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.UPDATE_FILING_DATE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_PRESENTER_URL} object for the remove journey`, async () => {
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_PRESENTER_URL].previousPage(undefined, mockRemoveRequest);
    expect(navigation).toEqual(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`NAVIGATION returns ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} when calling previousPage on ${config.UPDATE_FILING_DATE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_FILING_DATE_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_ENTITY_QUERY_URL} when calling previousPage on ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} when calling previousPage on ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
  });

  test(`NAVIGATION returns nothing when calling previousPage on ${config.RELEVANT_PERIOD_INTERRUPT_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_INTERRUPT_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual("");
  });

  test(`NAVIGATION returns ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL} when calling previousPage on ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
  });

  test(`NAVIGATION returns ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL} when calling previousPage on ${config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL);
  });

  test(`NAVIGATION returns ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM} when calling previousPage on ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
  });

  test(`NAVIGATION returns ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} when calling previousPage on ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
  });

  test(`NAVIGATION returns ${config.UPDATE_INTERRUPT_CARD_URL} when calling previousPage on ${config.OVERSEAS_ENTITY_QUERY_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_QUERY_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.UPDATE_INTERRUPT_CARD_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_INTERRUPT_CARD_URL} with 'journey' param set when calling previousPage on ${config.OVERSEAS_ENTITY_QUERY_URL} object for Remove journey`, async () => {
    const navigation = await NAVIGATION[config.OVERSEAS_ENTITY_QUERY_URL].previousPage(undefined, mockRemoveRequest);
    expect(navigation).toEqual(`${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_ENTITY_QUERY_URL} with 'journey' param set when calling previousPage on ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} object for Remove journey`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL].previousPage(undefined, mockRemoveRequest);
    expect(navigation).toEqual(`${config.OVERSEAS_ENTITY_QUERY_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_OTHER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_OTHER_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_GOV_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_GOV_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_CONFIRM_TO_REMOVE_URL + config.ROUTE_PARAM_BO_MO_TYPE + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`Navigation returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL}`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE} when calling previousPage on ${config.UPDATE_INTERRUPT_CARD_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_INTERRUPT_CARD_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_ANY_TRUSTS_INVOLVED_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_ANY_TRUSTS_INVOLVED_URL} when calling previousPage on ${config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_ANY_TRUSTS_INVOLVED_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL} when calling previousPage on ${config.UPDATE_REVIEW_STATEMENT_URL} object`, async () => {
    const mockRequest = { query: {} } as Request;
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_STATEMENT_URL].previousPage(undefined, mockRequest);
    expect(navigation).toEqual(config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
  });

  test(`NAVIGATION returns ${config.REMOVE_CONFIRM_STATEMENT_URL} when calling previousPage on ${config.UPDATE_REVIEW_STATEMENT_URL} object for Remove journey`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_STATEMENT_URL].previousPage(undefined, mockRemoveRequest);
    expect(navigation).toEqual(config.REMOVE_CONFIRM_STATEMENT_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL_WITH_PARAM_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL_WITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_ENTITY_PRESENTER_URL} when calling previousPage on ${config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL].previousPage();
    expect(navigation).toEqual(config.OVERSEAS_ENTITY_PRESENTER_URL);
  });

  test(`NAVIGATION returns ${config.OVERSEAS_ENTITY_PRESENTER_URL} when calling previousPage on ${config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL].previousPage();
    expect(navigation).toEqual(config.OVERSEAS_ENTITY_PRESENTER_URL);
  });

  test(`NAVIGATION returns ${config.WHO_IS_MAKING_UPDATE_PAGE} when calling previousPage on ${config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL].previousPage();
    expect(navigation).toEqual(config.WHO_IS_MAKING_UPDATE_PAGE);
  });

  test(`NAVIGATION returns ${config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_TYPE_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URLWITH_PARAM_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URLWITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL} when calling previousPage on ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL_WITH_PARAM_URL} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL_WITH_PARAM_URL].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_MANAGING_OFFICER_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_MANAGING_OFFICER_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} when calling previousPage on ${config.UPDATE_MANAGING_OFFICER_CORPORATE_URL + config.ID} object`, async () => {
    const navigation = await NAVIGATION[config.UPDATE_MANAGING_OFFICER_CORPORATE_URL + config.ID].previousPage();
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  });

  test(`NAVIGATION returns ${config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL} when in change journey and calling previousPage on ${config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL} object`, async () => {
    mockIsNoChangeJourney.mockReturnValueOnce(false);
    const navigation = await NAVIGATION[config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL].previousPage(mockGetApplicationData());
    expect(navigation).toEqual(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
  });
  test(`NAVIGATION returns ${config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL} when in no change journey and calling previousPage on ${config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL} object`, async () => {
    mockIsNoChangeJourney.mockReturnValueOnce(true);
    const navigation = await NAVIGATION[config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL].previousPage(mockGetApplicationData());
    expect(navigation).toEqual(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);
  });
});
