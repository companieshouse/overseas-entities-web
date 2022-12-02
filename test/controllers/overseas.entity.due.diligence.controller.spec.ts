import { OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK } from "../__mocks__/validation.mock";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.presenter.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import {
  ENTITY_PAGE,
  ENTITY_URL,
  LANDING_PAGE_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_URL,
  WHO_IS_MAKING_FILING_URL,
} from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT,
  FOUND_REDIRECT_TO,
  OVERSEAS_ENTITY_NO_EMAIL_SHOWN_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT,
} from "../__mocks__/text.mock";
import { ApplicationDataType } from '../../src/model';
import { EMAIL_ADDRESS } from "../__mocks__/session.mock";
import { EMPTY_IDENTITY_DATE_REQ_BODY_MOCK, getTwoMonthOldDate } from "../__mocks__/fields/date.mock";
import { ErrorMessages } from '../../src/validation/error.messages';
import { hasPresenter } from "../../src/middleware/navigation/has.presenter.middleware";
import { OverseasEntityDueDiligenceKey } from '../../src/model/overseas.entity.due.diligence.model';
import {
  OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
} from "../__mocks__/overseas.entity.due.diligence.mock";
import { DateTime } from "luxon";
import {
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE
} from "../__mocks__/due.diligence.mock";

const mockHasPresenterMiddleware = hasPresenter as jest.Mock;
mockHasPresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
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
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_NO_EMAIL_SHOWN_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
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
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
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
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${ENTITY_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${ENTITY_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
    });

    test("Test email is valid with long email address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test("Test email is valid with long email name and address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test("Test email is valid with very long email name and address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test(`redirect to ${ENTITY_PAGE}, no validation error for empty date`, async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        ...EMPTY_IDENTITY_DATE_REQ_BODY_MOCK
      };

      mockPrepareData.mockReturnValueOnce( dueDiligenceMock );
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${ENTITY_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.OE_DUE_DILIGENCE_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).not.toContain(ErrorMessages.COUNTY);
      expect(resp.text).toContain(ErrorMessages.UK_COUNTRY);
      expect(resp.text).toContain(ErrorMessages.POSTCODE);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.SUPERVISORY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PARTNER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH_DUE_DILIGENCE);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_AML_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PARTNER_NAME_LENGTH);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`catch error when renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page on POST method`, async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const twoMonthOldDate = getTwoMonthOldDate();
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] =  twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with INVALID_DATE error when identity date day is outside valid numbers`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
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
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
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
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] =  "0";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with INVALID_DATE error when identity date month is zero`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] =  "30";
      dueDiligenceMock["identity_date-month"] = "0";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} with DATE_OVER_3_MONTHS_BEFORE error when identity date is before 3 months ago`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      const moreThanThreeMonthsAgo = DateTime.now().minus({ months: 3, days: 1 });
      dueDiligenceMock["identity_date-day"] =  moreThanThreeMonthsAgo.day.toString();
      dueDiligenceMock["identity_date-month"] = moreThanThreeMonthsAgo.month.toString();
      dueDiligenceMock["identity_date-year"] = moreThanThreeMonthsAgo.year.toString();

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with DATE_NOT_IN_PAST_OR_TODAY error when identity date is in the future`, async () => {
      const dueDiligenceMock = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const inTheFuture = DateTime.now().plus({ years: 20 });
      dueDiligenceMock["identity_date-day"] =  inTheFuture.day.toString();
      dueDiligenceMock["identity_date-month"] = inTheFuture.month.toString();
      dueDiligenceMock["identity_date-year"] = inTheFuture.year.toString();

      const resp = await request(app)
        .post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with YEAR_LENGTH error when year is not 4 digits`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] =  "30";
      dueDiligenceMock["identity_date-month"] = "10";
      dueDiligenceMock["identity_date-year"] = "20";
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with no date errors when identity date is today`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const today = DateTime.now();
      dueDiligenceData["identity_date-day"] =  today.day.toString();
      dueDiligenceData["identity_date-month"] = today.month.toString();
      dueDiligenceData["identity_date-year"] = today.year.toString();

      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE} page with invalid character errors`, async () => {
      const overseasEntityDueDiligenceData = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK };
      const resp = await request(app).post(OVERSEAS_ENTITY_DUE_DILIGENCE_URL)
        .send(overseasEntityDueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

  });
});
