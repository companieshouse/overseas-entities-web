jest.mock("ioredis");
jest.mock('../../../src/service/transaction.service');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/service/overseas.entities.service');
jest.mock('../../../src/service/payment.service');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/feature.flag" );
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock("../../../src/service/overseas.entities.service");

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import request from "supertest";
import app from "../../../src/app";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { postTransaction, closeTransaction } from "../../../src/service/transaction.service";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { startPaymentsSession } from "../../../src/service/payment.service";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getPrivateOeDetails } from "../../../src/service/private.overseas.entity.details";
import { APPLICATION_DATA_CH_REF_UPDATE_MOCK, APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA, APPLICATION_DATA_UPDATE_BO_MOCK, APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, ENTITY_OBJECT_MOCK, ERROR, OVERSEAS_ENTITY_ID, PAYMENT_LINK_JOURNEY, TRANSACTION_CLOSED_RESPONSE, TRANSACTION_ID, APPLICATION_DATA_UPDATE_MO_PRIVATE_DATA_MOCK } from "../../__mocks__/session.mock";
import { UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, UPDATE_PRESENTER_CHANGE_EMAIL, UPDATE_PRESENTER_CHANGE_FULL_NAME, UPDATE_REVIEW_STATEMENT_URL, UPDATE_REVIEW_STATEMENT_PAGE, OVERSEAS_ENTITY_SECTION_HEADING, SECURE_UPDATE_FILTER_CHANGELINK, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_CHANGELINK, UPDATE_FILING_DATE_CHANGELINK, UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_CHANGELINK, UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_CHANGELINK } from "../../../src/config";
import { ANY_MESSAGE_ERROR, BENEFICIAL_OWNER_HEADING, CONTINUE_BUTTON_TEXT, NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENT, NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE, NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE, NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT, SERVICE_UNAVAILABLE, UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS } from "../../__mocks__/text.mock";
import { OverseasEntityKey, Transactionkey } from "../../../src/model/data.types.model";
import { ErrorMessages } from "../../../src/validation/error.messages";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetPrivateOeDetails = getPrivateOeDetails as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockOverseasEntity = updateOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( "CONFIRMATION_URL" );

describe("Update review overseas entity information controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReturnValue({
      ...APPLICATION_DATA_CH_REF_UPDATE_MOCK,
    });
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with email fetch`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const mockAppData = getMockAppDataWithoutEmail();

      mockGetApplicationData.mockReturnValue(mockAppData);
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "tester@test.com" });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(6);
      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(resp.text).toContain("tester@test.com");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with email not found`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const mockAppData = getMockAppDataWithoutEmail();

      mockGetApplicationData.mockReturnValue(mockAppData);
      mockGetPrivateOeDetails.mockReturnValueOnce(undefined);

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(6);
      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(0);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
      expect(resp.text).not.toContain("tester@test.com");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with contact details section and beneficial owner statements`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENT);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with managing officer private data set in app data`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_MO_PRIVATE_DATA_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("URA 1");
      expect(resp.text).toContain("URA addressLine1");
      expect(resp.text).toContain("URA addressLine2");
      expect(resp.text).toContain("URA town");
      expect(resp.text).toContain("URA country");
      expect(resp.text).toContain("URA county");
      expect(resp.text).toContain("URA postcode");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page overseas entity details section`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_SECTION_HEADING);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("SA000392");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page beneficial owner section is not rendered if no BO data`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_HEADING);
      expect(resp.text).not.toContain("Individual beneficial owner");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page managing officer section is not rendered if no MO data`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Managing officers");
      expect(resp.text).not.toContain("Individual managing officer");
      expect(resp.text).not.toContain("Corporate managing officer");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page and doesnt display the trusts section as the feature flag is off`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_BO_MOCK
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Trusts");
    });

    test(`that the ${UPDATE_REVIEW_STATEMENT_PAGE} page managing officer section is rendered if MO data exists`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Managing officers");
      expect(resp.text).toContain("Individual managing officer");
    });

    test(`that the ${UPDATE_REVIEW_STATEMENT_PAGE} page beneficial owner other section is rendered with principal address`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Other legal entity beneficial owner");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("addressLine2");
    });

    test(`that the ${UPDATE_REVIEW_STATEMENT_PAGE} page beneficial owner gov section is rendered with principal address`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA
      });
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Government or public authority beneficial owner");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("addressLine2");
      expect(resp.text).toContain("BY 2");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with change links`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_CHANGELINK);
      expect(resp.text).toContain(UPDATE_FILING_DATE_CHANGELINK);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_CHANGELINK);
      expect(resp.text).toContain(UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_CHANGELINK);
      expect(resp.text).toContain(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_CHANGELINK);
    });

    test('catch error when rendering the page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${PAYMENT_LINK_JOURNEY}, with transaction and OE id`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app)
        .post(UPDATE_REVIEW_STATEMENT_URL)
        .send({ no_change_review_statement: '1' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`redirect to ${PAYMENT_LINK_JOURNEY}, if Save and Resume not enabled`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const mockData = { ...APPLICATION_DATA_UPDATE_BO_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app)
        .post(UPDATE_REVIEW_STATEMENT_URL)
        .send({ no_change_review_statement: '1' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`should redirect to UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL when noChangeReviewStatement is '0'`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app)
        .post(UPDATE_REVIEW_STATEMENT_URL)
        .send({ no_change_review_statement: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    });

    test(`redirects to ${PAYMENT_LINK_JOURNEY}, when noChangeReviewStatement is '1'`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app)
        .post(UPDATE_REVIEW_STATEMENT_URL)
        .send({ no_change_review_statement: "1" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test("validation error when posting", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).post(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_UPDATE_STATEMENT);
    });

    test(`catch error on POST action for ${UPDATE_REVIEW_STATEMENT_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      mockCloseTransaction.mockImplementation(() => {
        throw ERROR;
      });
      const resp = await request(app)
        .post(UPDATE_REVIEW_STATEMENT_URL)
        .send({ no_change_review_statement: "1" });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});

const getMockAppDataWithoutEmail = () => {
  const mockAppData = { ...APPLICATION_DATA_UPDATE_BO_MOCK };
  mockAppData.entity = { ...ENTITY_OBJECT_MOCK };
  mockAppData.entity.email = undefined;
  mockAppData.transaction_id = "123456";
  mockAppData.overseas_entity_id = "654321";
  return mockAppData;
};
