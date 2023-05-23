
import { checkAndReviewBeneficialOwner } from "../../../src/utils/update/review.beneficial.owner";
import { APPLICATION_DATA_BENEFICIAL_OWNER_UNDEFINED_UPDATE_REVIEW_BO,
  APPLICATION_DATA_MOCK_N0_BOI, APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO,
  APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA, APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS,
  REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY, UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST } from "../../__mocks__/session.mock";

describe(`Test review beneficial Owners`, () => {
  test(`Test review beneficial Owners check beneficial owner individual validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      { ...APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS,
        ...REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY
      }
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`Test review beneficial Owners check beneficial owner gov validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      { ...APPLICATION_DATA_MOCK_N0_BOI }
    )).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
  });

  test(`redirect url value only with update review beneficial owner data `, () => {
    expect(checkAndReviewBeneficialOwner({ ...APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO }))
      .toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`review beneficial owner with only beneficial owner individual`, () => {
    expect(checkAndReviewBeneficialOwner({
      ...APPLICATION_DATA_BENEFICIAL_OWNER_UNDEFINED_UPDATE_REVIEW_BO,
    })).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });

  test(`review beneficial owner with only beneficial update review data`, () => {
    expect(checkAndReviewBeneficialOwner({
      ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA,
    })).toEqual(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
  });
});
