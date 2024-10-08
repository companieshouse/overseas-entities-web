jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/save.and.continue");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { getApplicationData, getRemove, setApplicationData } from "../../../src/utils/application.data";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
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
  EntityNumberKey,
  IsNotProprietorOfLandKey
} from "../../../src/model/data.types.model";
import { REMOVE_SERVICE_NAME } from "../../../src/config";
import { APPLICATION_DATA_REMOVE_MOCK } from "../../__mocks__/session.mock";
import { RemoveKey } from "../../../src/model/remove.type.model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetRemove = getRemove as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;

describe("Remove confirmation statement controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRemove.mockReturnValue({});
    mockJourneyDetectionMiddleware.mockClear();
    mockCsrfProtectionMiddleware.mockClear();
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
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
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

    test.each([
      [config.UPDATE_REVIEW_STATEMENT_URL, "no change journey", true ],
      [config.UPDATE_CHECK_YOUR_ANSWERS_URL, "change journey", false ]
    ])(`redirects to the %s page when checkbox is selected and on %s`, async (redirectUrl, journeyType, isNoChange) => {
      const APP_DATA_REMOVE_CHANGE_JOURNEY_MOCK = { ...APPLICATION_DATA_REMOVE_MOCK };

      if (APP_DATA_REMOVE_CHANGE_JOURNEY_MOCK.update){
        APP_DATA_REMOVE_CHANGE_JOURNEY_MOCK.update.no_change = isNoChange;
      }

      mockGetApplicationData.mockReturnValue(APP_DATA_REMOVE_CHANGE_JOURNEY_MOCK);

      const resp = await request(app)
        .post(`${config.REMOVE_CONFIRM_STATEMENT_URL}`)
        .send({ removal_confirmation: 1 });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${redirectUrl}`);
      expect(resp.header.location).toEqual(`${redirectUrl}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockGetRemove).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      const populatedRemoveObject = mockSetApplicationData.mock.calls[0][1];
      expect(populatedRemoveObject[IsNotProprietorOfLandKey]).toEqual(true);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(RemoveKey);
    });
  });
});
