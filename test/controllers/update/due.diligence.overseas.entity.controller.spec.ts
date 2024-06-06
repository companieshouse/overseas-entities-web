jest.mock("ioredis");
jest.mock("../../../src/middleware/authentication.middleware");
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock("../../../src/utils/application.data");
jest.mock('../../../src/middleware/navigation/update/has.who.is.making.update.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../../src/app";
import { hasWhoIsMakingUpdate } from "../../../src/middleware/navigation/update/has.who.is.making.update.middleware";
import { OverseasEntityDueDiligenceKey } from "../../../src/model/overseas.entity.due.diligence.model";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, setApplicationData, prepareData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { ApplicationDataType } from '../../../src/model';
import { EMAIL_ADDRESS } from "../../__mocks__/session.mock";
import { EMPTY_IDENTITY_DATE_REQ_BODY_MOCK, getTwoMonthOldDate } from "../../__mocks__/fields/date.mock";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { DateTime } from "luxon";
import { OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK } from "../../__mocks__/validation.mock";
import {
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE
} from "../../__mocks__/due.diligence.mock";
import {
  OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_MOCK,
  OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK
} from "../../__mocks__/overseas.entity.due.diligence.mock";
import {
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL
} from "../../../src/config";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT,
  FOUND_REDIRECT_TO,
  OVERSEAS_ENTITY_NO_EMAIL_OR_VERIFICATION_DATE_SHOWN_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
} from "../../__mocks__/text.mock";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasWhoIsMakingUpdate = hasWhoIsMakingUpdate as jest.Mock;
mockHasWhoIsMakingUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockPrepareData = prepareData as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("UPDATE DUE DILIGENCE OVERSEAS ENTITY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [OverseasEntityDueDiligenceKey]: null });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_NO_EMAIL_OR_VERIFICATION_DATE_SHOWN_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page on GET method with session data populated`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);
    });

    test(`catch error when renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page on GET method`, async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page after a successful post from ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL}`);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL}`);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
    });

    test("Test email is valid with long email address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with long email name and address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with very long email name and address", async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceMock["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceMock["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceMock["identity_date-year"] = twoMonthOldDate.year.toString();
      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test(`redirect to ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page, no validation error for empty date`, async () => {
      const dueDiligenceMock = {
        ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        ...EMPTY_IDENTITY_DATE_REQ_BODY_MOCK
      };

      mockPrepareData.mockReturnValueOnce(dueDiligenceMock);
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL}`);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
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
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.SUPERVISORY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PARTNER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
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
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.MAX_AML_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PARTNER_NAME_LENGTH);
    });

    test(`catch error when renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page on POST method`, async () => {
      mockSetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const twoMonthOldDate = getTwoMonthOldDate();
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only DAY error when identity date day is empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only MONTH error when identity date month is empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "11";
      dueDiligenceMock["identity_date-month"] = "";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only YEAR error when identity date year is empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "11";
      dueDiligenceMock["identity_date-month"] = "2";
      dueDiligenceMock["identity_date-year"] = "";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID DATE error when identity date month and year are empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "01";
      dueDiligenceMock["identity_date-month"] = "";
      dueDiligenceMock["identity_date-year"] = "";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID DATE error when identity date day and year are empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "";
      dueDiligenceMock["identity_date-month"] = "01";
      dueDiligenceMock["identity_date-year"] = "";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID DATE error when identity date day and month are empty`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "";
      dueDiligenceMock["identity_date-month"] = "";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID_DATE error when identity date day is outside valid numbers`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "32";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID_DATE error when identity date month is outside valid numbers`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "11";
      dueDiligenceMock["identity_date-month"] = "32";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID_DATE error when identity date day is zero`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "0";
      dueDiligenceMock["identity_date-month"] = "11";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only INVALID_DATE error when identity date month is zero`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "30";
      dueDiligenceMock["identity_date-month"] = "0";
      dueDiligenceMock["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the current page ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only DATE_OVER_3_MONTHS_BEFORE error when identity date is before 3 months ago`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      const moreThanThreeMonthsAgo = DateTime.now().minus({ months: 3, days: 1 });
      dueDiligenceMock["identity_date-day"] = moreThanThreeMonthsAgo.day.toString();
      dueDiligenceMock["identity_date-month"] = moreThanThreeMonthsAgo.month.toString();
      dueDiligenceMock["identity_date-year"] = moreThanThreeMonthsAgo.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when identity date is in the future`, async () => {
      const dueDiligenceMock = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const inTheFuture = DateTime.now().plus({ years: 20 });
      dueDiligenceMock["identity_date-day"] = inTheFuture.day.toString();
      dueDiligenceMock["identity_date-month"] = inTheFuture.month.toString();
      dueDiligenceMock["identity_date-year"] = inTheFuture.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with only YEAR_LENGTH error when year is not 4 digits`, async () => {
      const dueDiligenceMock = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceMock["identity_date-day"] = "30";
      dueDiligenceMock["identity_date-month"] = "10";
      dueDiligenceMock["identity_date-year"] = "20";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceMock);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with no date errors when identity date is today`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const today = DateTime.now();
      dueDiligenceData["identity_date-day"] = today.day.toString();
      dueDiligenceData["identity_date-month"] = today.month.toString();
      dueDiligenceData["identity_date-year"] = today.year.toString();

      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page with invalid character errors`, async () => {
      const overseasEntityDueDiligenceData = { ...OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK };
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL)
        .send(overseasEntityDueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
    });
  });
});
