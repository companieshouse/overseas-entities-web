
import { checkAndReviewBeneficialOwner } from "../../../src/utils/update/review.beneficial.owner";
import { APPLICATION_DATA_MOCK_N0_BOI, APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO, APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS, REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY } from "../../__mocks__/session.mock";

describe(`Test review beneficial Owners`, () => {

  test(`Test review beneficial Owners check beneficial owner individual validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      { ...APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS,
        ...REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY
      }
    )).toEqual("/update-an-overseas-entity/review-beneficial-owner-individual?index=0");
  });

  test(`Test review beneficial Owners check beneficial owner gov validation `, () => {
    expect(checkAndReviewBeneficialOwner(
      { ...APPLICATION_DATA_MOCK_N0_BOI }
    )).toEqual("/update-an-overseas-entity/review-beneficial-owner-gov?index=0");
  });

  test(`redirect url value only with update review beneficial owner data `, () => {
    expect(checkAndReviewBeneficialOwner({ ...APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO })).toEqual("/update-an-overseas-entity/review-beneficial-owner-individual?index=0");
  });
});
