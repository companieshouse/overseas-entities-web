import { getTwoMonthOldDate } from "../__mocks__/fields/date.mock";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.presenter.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import {
  ENTITY_PAGE,
  ENTITY_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_URL,
  WHO_IS_MAKING_FILING_URL,
} from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER,
  OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT,
  FOUND_REDIRECT_TO,
} from "../__mocks__/text.mock";
import { ErrorMessages } from '../../src/validation/error.messages';
import { hasPresenter } from "../../src/middleware/navigation/has.presenter.middleware";
import { OverseasEntityDueDiligenceKey } from '../../src/model/overseas.entity.due.diligence.model';
import {
  OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
} from "../__mocks__/overseas.entity.due.diligence.mock";
import { DateTime } from "luxon";
import { DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE } from "../__mocks__/due.diligence.mock";

const mockHasPresenterMiddleware = hasPresenter as jest.Mock;
mockHasPresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("OVERSEAS_ENTITY_DUE_DILIGENCE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [OverseasEntityDueDiligenceKey]: null } );
      const resp = await request(app).get(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page on GET method with session data populated`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } );
      const resp = await request(app).get(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`catch error when renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page on GET method`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirect to ${ENTITY_PAGE} page after a successful post from ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${ENTITY_URL}`);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.OE_DUE_DILIGENCE_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTY);
      expect(resp.text).toContain(ErrorMessages.UK_COUNTRY);
      expect(resp.text).toContain(ErrorMessages.POSTCODE);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.SUPERVISORY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PARTNER_NAME);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
    });

    test(`catch error when renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page on POST method`, async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with INVALID_DATE error when identity date day is outside valid numbers`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      dueDiligenceMock["identity_date-day"] =  "32";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with INVALID_DATE error when identity date month is outside valid numbers`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      dueDiligenceMock["identity_date-day"] =  "11";
      dueDiligenceMock["identity_date-month"] = "32";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });


    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date day is zero`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      dueDiligenceMock["identity_date-day"] =  "0";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date month is zero`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      dueDiligenceMock["identity_date-day"] =  "30";
      dueDiligenceMock["identity_date-month"] = "0";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with DATE_OVER_3_MONTHS_BEFORE error when identity date is before 3 months ago`, async () => {
      const dueDiligenceMock = OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK;
      const moreThanThreeMonthsAgo = DateTime.now().minus({ months: 3, days: 1 });
      dueDiligenceMock["identity_date-day"] =  moreThanThreeMonthsAgo.day.toString();
      dueDiligenceMock["identity_date-month"] = moreThanThreeMonthsAgo.month.toString();
      dueDiligenceMock["identity_date-year"] = moreThanThreeMonthsAgo.year.toString();
      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with DATE_NOT_IN_PAST error when identity date is in the future`, async () => {
      const dueDiligenceMock = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const inTheFuture = DateTime.now().plus({ years: 20 });
      dueDiligenceMock["identity_date-day"] =  inTheFuture.day.toString();
      dueDiligenceMock["identity_date-month"] = inTheFuture.month.toString();
      dueDiligenceMock["identity_date-year"] = inTheFuture.year.toString();
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST);
    });

  });
});
