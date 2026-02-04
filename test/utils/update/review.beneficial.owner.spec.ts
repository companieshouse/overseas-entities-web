
import { checkAndReviewBeneficialOwner } from "../../../src/utils/update/review.beneficial.owner";
import {
  APPLICATION_DATA_MOCK_N0_BOI,
  REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY,
  APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS,
  APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO,
  APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA,
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST,
  APPLICATION_DATA_BENEFICIAL_OWNER_UNDEFINED_UPDATE_REVIEW_BO,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST
} from "../../__mocks__/session.mock";

const req: any = {
  originalUrl: "/update-an-overseas-entity/update-beneficial-owner-bo-mo-review"
};

describe(`Test review beneficial Owners`, () => {

  test(`Test review beneficial Owners check beneficial owner individual validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      req,
      {
        ...APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS,
        ...REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY
      }
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`Test review beneficial Owners check beneficial owner gov validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      req,
      APPLICATION_DATA_MOCK_N0_BOI
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
  });

  test(`redirect url value only with update review beneficial owner data `, () => {
    expect(checkAndReviewBeneficialOwner(
      req,
      APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`review beneficial owner with only beneficial owner individual`, () => {
    expect(checkAndReviewBeneficialOwner(
      req,
      APPLICATION_DATA_BENEFICIAL_OWNER_UNDEFINED_UPDATE_REVIEW_BO,
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`review beneficial owner with only beneficial update review data`, () => {
    expect(checkAndReviewBeneficialOwner(
      req,
      APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA,
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });
});
