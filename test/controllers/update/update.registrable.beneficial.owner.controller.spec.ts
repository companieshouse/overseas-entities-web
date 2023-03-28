jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL
} from "../../../src/config";
import app from "../../../src/app";
import {
  APPLICATION_DATA_MOCK
} from '../../__mocks__/session.mock';
import {
  PAGE_TITLE_ERROR,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  RADIO_BUTTON_YES_SELECTED,
  RADIO_BUTTON_NO_SELECTED
} from "../../__mocks__/text.mock";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { RegistrableBeneficialOwnerKey } from "../../../src/model/update.type.model";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import { UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../../dist/config";
import { yesNoResponse } from "../../../src/model/data.types.model";

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

describe("Update registrable beneficial owner controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page with radios selected to ${yesNoResponse.Yes}`, async () => {
      if (APPLICATION_DATA_MOCK.update){
        APPLICATION_DATA_MOCK.update.registrable_beneficial_owner = yesNoResponse.Yes;
      }
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
    });

    test(`renders the ${UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page with radios selected to ${yesNoResponse.No}`, async () => {
      if (APPLICATION_DATA_MOCK.update){
        APPLICATION_DATA_MOCK.update.registrable_beneficial_owner = yesNoResponse.No;
      }
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page when ${yesNoResponse.Yes} is selected`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app)
        .post(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE} page when ${yesNoResponse.No} is selected`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app)
        .post(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: yesNoResponse.No });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("POST empty object and check for error in page title", async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).post(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_REGISTRABLE_BENEFICIAL_OWNER);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL)
        .send({ [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
