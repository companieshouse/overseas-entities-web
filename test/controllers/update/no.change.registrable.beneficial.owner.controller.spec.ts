jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock("../../../src/utils/feature.flag");
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/service/overseas.entities.service');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";

import { yesNoResponse } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { RegistrableBeneficialOwnerKey } from "../../../src/model/update.type.model";

import { getApplicationData, fetchApplicationData, setExtraData } from "../../../src/utils/application.data";
import {
  OVERSEAS_ENTITY_ID,
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
} from "../../__mocks__/session.mock";

import {
  UPDATE_STATEMENT_VALIDATION_ERRORS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_STATEMENT_VALIDATION_ERRORS_WITH_PARAMS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
} from "../../../src/config";

import {
  PAGE_TITLE_ERROR,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE,
} from "../../__mocks__/text.mock";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;
mockUpdateOverseasEntity.mockReturnValue(OVERSEAS_ENTITY_ID);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe("No change registrable beneficial owner", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`that ${UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page is rendered`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page with radios selected to ${yesNoResponse.Yes}`, async () => {
      if (APPLICATION_DATA_MOCK.update) {
        APPLICATION_DATA_MOCK.update.registrable_beneficial_owner = yesNoResponse.Yes;
      }
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
    });

    test(`renders the ${UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page with radios selected to ${yesNoResponse.No}`, async () => {
      if (APPLICATION_DATA_MOCK.update) {
        APPLICATION_DATA_MOCK.update.registrable_beneficial_owner = yesNoResponse.No;
      }
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page with unselected radio button if no update data`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK_WITHOUT_UPDATE });
      const resp = await request(app).get(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);

    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`Test redirect to ${UPDATE_STATEMENT_VALIDATION_ERRORS_URL} page when 'no reasonable cause' is selected`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app)
        .post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: "1" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the update-statement-validation-errors page when 'has reasonable cause' is selected and REDIS_flag is set to OFF`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      mockIsActiveFeature.mockReturnValue(false);
      const resp = await request(app)
        .post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
    });

    test(`redirects to the update-statement-validation-errors page when 'has reasonable cause' is selected and REDIS_flag is set to ON`, async () => {
      mockFetchApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      mockIsActiveFeature.mockReturnValue(true);
      const resp = await request(app)
        .post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL)
        .send({ [RegistrableBeneficialOwnerKey]: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_STATEMENT_VALIDATION_ERRORS_WITH_PARAMS_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`with statement validation flag on, redirects to the update-statement-validation-errors page when 'has reasonable cause' is selected`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      mockFetchApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      mockIsActiveFeature.mockReturnValue(true);
      mockSaveAndContinue.mockReturnValue(Promise.resolve());

      const resp = await request(app)
        .post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL)
        .send({ [RegistrableBeneficialOwnerKey]: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_STATEMENT_VALIDATION_ERRORS_WITH_PARAMS_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("Test validation error is displayed when posting empty object", async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_REGISTRABLE_BENEFICIAL_OWNER);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes });
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
