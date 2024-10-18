jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/utils/feature.flag');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL
} from "../../../src/config";
import { getApplicationData, mapDataObjectToFields, prepareData } from "../../../src/utils/application.data";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  DISTINCT_PRINCIPAL_ADDRESS_MOCK,
  UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK
} from "../../__mocks__/session.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import request from "supertest";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING,
  TRUSTS_NOC_HEADING,
  BO_NOC_HEADING,
  FIRM_NOC_HEADING,
  FIRM_CONTROL_NOC_HEADING,
  TRUST_CONTROL_NOC_HEADING,
  OWNER_OF_LAND_PERSON_NOC_HEADING,
  OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING,
} from "../../__mocks__/text.mock";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";
import { logger } from "../../../src/utils/logger";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { isActiveFeature } from "../../../src/utils/feature.flag";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockMapDataObjectToFields = mapDataObjectToFields as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe(`Update review beneficial owner other`, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET tests`, () => {
    test(`render the ${UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL
      });
      mockMapDataObjectToFields.mockReturnValueOnce(DISTINCT_PRINCIPAL_ADDRESS_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + '?index=0');
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain("principal addressLine1");
    });

    test(`render the ${UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE} page with the flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC off`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL
      });

      mockMapDataObjectToFields.mockReturnValueOnce(DISTINCT_PRINCIPAL_ADDRESS_MOCK);

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + '?index=0');

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
      expect(resp.text).toContain("principal addressLine1");
    });

    test(`render the ${UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE} page with the flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC on`, async () => {
      mockIsActiveFeature.mockReturnValue(true);

      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL
      });

      mockMapDataObjectToFields.mockReturnValueOnce(DISTINCT_PRINCIPAL_ADDRESS_MOCK);

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + '?index=0');

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING);
      expect(resp.text).toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
      expect(resp.text).toContain("principal addressLine1");
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + '?index=0');

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("return empty object when no address in data to review", async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + '?index=0');
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING);
      expect(resp.text).not.toContain("principal addressLine1");
    });
  });

  describe(`POST tests`, () => {
    test(`redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page on successful submission`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_BO_MOCK
      });

      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK );

      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + "?index=0")
        .send(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/update-an-overseas-entity/update-beneficial-owner-type");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`throw validation error on bo other review submission without form address data`, async () => {
      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL)
        .send(UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_HEADING);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });
});
