jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { getApplicationData, getRemove } from "../../../src/utils/application.data";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  REMOVE_CONFIRMATION_STATEMENT_TITLE,
  SERVICE_UNAVAILABLE
} from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { ApplicationData } from "../../../src/model";
import {
  EntityNameKey,
  EntityNumberKey
} from "../../../src/model/data.types.model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetRemove = getRemove as jest.Mock;

describe("Remove confirmation statement controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRemove.mockReturnValue({});
  });

  describe ("GET tests", () => {
    test(`renders the ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`, async () => {
      const appData: ApplicationData = {
        [EntityNameKey]: "Test Company",
        [EntityNumberKey]: "OE001100",
      };
      mockGetApplicationData.mockReturnValueOnce(appData);
      const resp = await request(app).get(`${config.REMOVE_CONFIRM_STATEMENT_URL}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_CONFIRMATION_STATEMENT_TITLE);
      expect(resp.text).toContain(appData[EntityNameKey]);
      expect(resp.text).toContain(appData[EntityNumberKey]);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("catch error on current page for GET method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(`${config.REMOVE_CONFIRM_STATEMENT_URL}`);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe ("POST tests", () => {
    test(`renders the ${config.REMOVE_CONFIRM_STATEMENT_PAGE} with error when checkbox is empty`, async () => {
      const resp = await request(app).post(`${config.REMOVE_CONFIRM_STATEMENT_URL}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_CONFIRMATION_STATEMENT_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_TO_CONFIRM_REMOVE_STATEMENT);
    });
  });
});
