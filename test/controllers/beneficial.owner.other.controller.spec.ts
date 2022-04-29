jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { BENEFICIAL_OWNER_OTHER_OBJECT_MOCK, REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY } from "../__mocks__/session.mock";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { authentication } from "../../src/controllers";
import app from "../../src/app";
import { BENEFICIAL_OWNER_OTHER_URL, BENEFICIAL_OWNER_TYPE_URL } from "../../src/config";
import { BENEFICIAL_OWNER_OTHER_PAGE_HEADING, MESSAGE_ERROR, SERVICE_UNAVAILABLE  } from "../__mocks__/text.mock";
import { HasSamePrincipalAddressKey, IsOnSanctionsListKey, NatureOfControlType, yesNoResponse } from "../../src/model/data.types.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";

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

    test("renders the page through GET", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerOtherKey]: BENEFICIAL_OWNER_OTHER_OBJECT_MOCK });
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
      expect(beneficialOwnerOther.register_name).toEqual( "ThisRegister");
      expect(beneficialOwnerOther.registration_number).toEqual("123456789");
      expect(beneficialOwnerOther.is_on_register_in_country_formed_in).toEqual(yesNoResponse.Yes);
      expect(beneficialOwnerOther.beneficial_owner_nature_of_control_types).toEqual([NatureOfControlType.over_25_percent_of_voting_rights]);
      expect(beneficialOwnerOther.trustees_nature_of_control_types).toEqual([NatureOfControlType.appoint_or_remove_majority_board_directors]);
      expect(beneficialOwnerOther.non_legal_firm_members_nature_of_control_types).toEqual([NatureOfControlType.over_25_percent_of_shares]);
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

  });
});
