import { addCeasedDateToTemplateOptions, addResignedDateToTemplateOptions } from "../../../src/utils/update/ceased_date_util";
import { APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO, REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA, UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO } from "../../__mocks__/session.mock";

describe('Test add resign date to template', () => {

  test(`that template optipn is returned with is_stil_bo data`, () => {
    expect (addCeasedDateToTemplateOptions(
      REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
      APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO,
      REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA))
      .toEqual(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA);
  });

  test(`that template option is returned with is_still_mo data`, () => {
    expect (addResignedDateToTemplateOptions(
      UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO,
      APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO,
      UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO))
      .toEqual(UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO);
  });
});

