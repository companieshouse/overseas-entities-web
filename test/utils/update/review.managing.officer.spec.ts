import { checkAndReviewManagingOfficers } from "../../../src/utils/update/review.managing.officer";
import { APPLICATION_DATA_UNSUBMITTED_UPDATE_REVIEW_MO, APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO, APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST } from "../../__mocks__/session.mock";

describe('Test review managing officers', () => {

  test(`Test review back click validation for individual managing officers`, () => {
    expect(checkAndReviewManagingOfficers(
      {
        ...APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO,
      }
    )).toEqual("");
  });

  test(`Re-direct to unsubmitted MO individual who needs reviewed`, () => {
    expect(checkAndReviewManagingOfficers(
      {
        ...APPLICATION_DATA_UNSUBMITTED_UPDATE_REVIEW_MO
      }
    )).toEqual("/update-an-overseas-entity/review-individual-managing-officer?index=0");
  });

  test(`review beneficial individual managing officer with only managing officer data`, () => {
    expect(checkAndReviewManagingOfficers({
      ...APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO,
    })).toEqual("");
  });

  test(`review beneficial individual managing officer with only managing officer data`, () => {
    expect(checkAndReviewManagingOfficers({
      ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA,
    })).toEqual(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);
  });
});
