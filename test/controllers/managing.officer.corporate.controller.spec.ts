import {
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey,
} from "../../src/model/data.types.model";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import { MANAGING_OFFICER_CORPORATE_OBJECT_MOCK } from "../__mocks__/session.mock";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_CORPORATE_URL } from "../../src/config";
import { MANAGING_OFFICER_CORPORATE_PAGE_TITLE, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { managingOfficerCorporateType } from "../../src/model";
import { ManagingOfficerCorporateKey } from '../../src/model/managing.officer.corporate.model';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("MANAGING_OFFICER CORPORATE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test("renders the managing officer corporate page", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [ManagingOfficerCorporateKey]: MANAGING_OFFICER_CORPORATE_OBJECT_MOCK });
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain("Joe Bloggs Ltd");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("legalForm");
      expect(resp.text).toContain("LegAuth");
      expect(resp.text).toContain("123456789");
    });

    test("Should render the error page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });

  });


  describe("POST tests", () => {
    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app).post(MANAGING_OFFICER_CORPORATE_URL);
      const managingOfficerCorporate = mockSetApplicationData.mock.calls[0][1];

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(managingOfficerCorporate).toEqual(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      expect(managingOfficerCorporate.name).toEqual("Joe Bloggs Ltd");
      expect(managingOfficerCorporate.legal_form).toEqual("legalForm");
      expect(managingOfficerCorporate.law_governed).toEqual("LegAuth");
      expect(managingOfficerCorporate.registration_number).toEqual("123456789");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerCorporateType.ManagingOfficerCorporateKey);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () =>  { return { [IsOnRegisterInCountryFormedInKey]: "1", [HasSamePrincipalAddressKey]: "0" }; } );

      const resp = await request(app).post(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

  });
});
