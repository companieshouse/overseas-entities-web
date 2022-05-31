jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import {
  BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY,
} from "../__mocks__/session.mock";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import app from "../../src/app";
import { BENEFICIAL_OWNER_OTHER_PAGE, BENEFICIAL_OWNER_OTHER_URL, BENEFICIAL_OWNER_TYPE_URL } from "../../src/config";
import { BENEFICIAL_OWNER_OTHER_PAGE_HEADING, ERROR_LIST, MESSAGE_ERROR, SERVICE_UNAVAILABLE  } from "../__mocks__/text.mock";
import { HasSamePrincipalAddressKey, IsOnSanctionsListKey, NatureOfControlType, yesNoResponse } from "../../src/model/data.types.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK } from "../__mocks__/validation.mock";
import { ErrorMessages } from "../../src/validation/error.messages";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("BENEFICIAL OWNER OTHER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [BeneficialOwnerOtherKey]: null } );
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
    });

    test("renders the page through GET", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerOtherKey]: BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS });
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain("TestCorporation");
      expect(resp.text).toContain("TheLaw");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("BY 2");
    });

    test("Should render the error page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => {
        return { ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK, [IsOnSanctionsListKey]: "0" };
      });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(302);
      const beneficialOwnerOther = mockSetApplicationData.mock.calls[0][1];
      expect(beneficialOwnerOther.name).toEqual("TestCorporation");
      expect(beneficialOwnerOther.legal_form).toEqual("TheLegalForm");
      expect(beneficialOwnerOther.law_governed).toEqual("TheLaw");
      expect(beneficialOwnerOther.public_register_name).toEqual( "ThisRegister");
      expect(beneficialOwnerOther.registration_number).toEqual("123456789");
      expect(beneficialOwnerOther.is_on_register_in_country_formed_in).toEqual(yesNoResponse.Yes);
      expect(beneficialOwnerOther.beneficial_owner_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS]);
      expect(beneficialOwnerOther.trustees_nature_of_control_types).toEqual([NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]);
      expect(beneficialOwnerOther.non_legal_firm_members_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(beneficialOwnerOther[IsOnSanctionsListKey]).toEqual(yesNoResponse.No);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerOtherKey);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () =>  { return { [IsOnSanctionsListKey]: "1", [HasSamePrincipalAddressKey]: "0" }; } );

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY );

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LEGAL_FORM_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAW_GOVERNED_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NUMBER_LENGTH);
    });
  });
});
