jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.presenter.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import {
  DUE_DILIGENCE_PAGE,
  DUE_DILIGENCE_URL,
  ENTITY_PAGE,
  ENTITY_URL,
  WHO_IS_MAKING_FILING_URL,
} from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  FOUND_REDIRECT_TO,
  DUE_DILIGENCE_PAGE_TITLE,
  DUE_DILIGENCE_NAME_TEXT,
  DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER
} from "../__mocks__/text.mock";
import { ErrorMessages } from '../../src/validation/error.messages';
import { hasPresenter } from "../../src/middleware/navigation/has.presenter.middleware";
import {
  DUE_DILIGENCE_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE,
} from "../__mocks__/due.diligence.mock";
import { DueDiligenceKey } from '../../src/model/due.diligence.model';
import { getTwoMonthOldDate } from "../__mocks__/fields/date.mock";

const mockHasPresenterMiddleware = hasPresenter as jest.Mock;
mockHasPresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("DUE_DILIGENCE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${DUE_DILIGENCE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [DueDiligenceKey]: null } );
      const resp = await request(app).get(DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page on GET method with session data populated`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK } );
      const resp = await request(app).get(DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.agent_code);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.partner_name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.diligence);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`catch error when renders the ${DUE_DILIGENCE_PAGE} page on GET method`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirect to ${ENTITY_PAGE} page after a successful post from ${DUE_DILIGENCE_PAGE} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK } );

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${ENTITY_URL}`);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} with error messages when sending no data`, async () => {
      const resp = await request(app)
        .post(DUE_DILIGENCE_URL)
        .send(DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DUE_DILIGENCE_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTY);
      expect(resp.text).toContain(ErrorMessages.UK_COUNTRY);
      expect(resp.text).toContain(ErrorMessages.POSTCODE);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).toContain(ErrorMessages.SUPERVISORY_NAME);
      expect(resp.text).toContain(ErrorMessages.AGENT_CODE);
      expect(resp.text).toContain(ErrorMessages.PARTNER_NAME);
      expect(resp.text).toContain(ErrorMessages.CHECK_DILIGENCE);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date day is outside valid numbers`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "32";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date month is outside valid numbers`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "30";
      dueDiligenceData["identity_date-month"] = "13";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date day is zero`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "0";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date month is zero`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "30";
      dueDiligenceData["identity_date-month"] = "0";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS error when identity date month is more than 3 months in the past`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "30";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${DUE_DILIGENCE_PAGE} page with DATE_NOT_IN_PAST error when identity date month is in the future`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] =  "30";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2050";
      const resp = await request(app).post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST);
    });

    test(`catch error when renders the ${DUE_DILIGENCE_PAGE} page on POST method`, async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
