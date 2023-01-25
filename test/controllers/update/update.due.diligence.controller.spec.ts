jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_DUE_DILIGENCE_PAGE,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  UPDATE_DUE_DILIGENCE_URL,
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  // OVERSEAS_ENTITY_QUERY_URL,
  // UPDATE_LANDING_PAGE_URL,
  // WHO_IS_MAKING_FILING_URL
} from "../../../src/config";
import app from "../../../src/app";

import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  FOUND_REDIRECT_TO,
  DUE_DILIGENCE_PAGE_TITLE,
  DUE_DILIGENCE_NAME_TEXT,
  DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER,
  // PAGE_TITLE_ERROR,
  // SAVE_AND_CONTINUE_BUTTON_TEXT,
  DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT,
  DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT,
  DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT,
  DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT,
  DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
} from "../../__mocks__/text.mock";

import {
  DUE_DILIGENCE_OBJECT_MOCK,
  // DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  // DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  // DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_OBJECT_MOCK,
  // DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK
} from "../../__mocks__/due.diligence.mock";

// import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData, setApplicationData, prepareData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";

// import { EMAIL_ADDRESS } from "../../__mocks__/session.mock";
import { DueDiligenceKey } from '../../../src/model/due.diligence.model';
import { getTwoMonthOldDate } from "../../__mocks__/fields/date.mock";
// import { DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK } from "../../__mocks__/validation.mock";
// import { DateTime } from "luxon";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("Update due diligence controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [DueDiligenceKey]: null });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} when successful`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK } );

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_CHECK_YOUR_ANSWERS_URL}`);
    })
  });

  test(`catch errors when rendering ${UPDATE_DUE_DILIGENCE_URL} on POST`, async () => {
    mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
