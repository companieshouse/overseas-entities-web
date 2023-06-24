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
import { getApplicationData } from "../../../src/utils/application.data";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { APPLICATION_DATA_CH_REF_UPDATE_MOCK, APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA, APPLICATION_DATA_UPDATE_BO_MOCK, APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, ERROR, OVERSEAS_ENTITY_ID, PAYMENT_LINK_JOURNEY, TRANSACTION_CLOSED_RESPONSE, TRANSACTION_ID } from "../../__mocks__/session.mock";
import { UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, UPDATE_PRESENTER_CHANGE_EMAIL, UPDATE_PRESENTER_CHANGE_FULL_NAME, UPDATE_REVIEW_STATEMENT_URL, UPDATE_REVIEW_STATEMENT_PAGE, OVERSEAS_ENTITY_SECTION_HEADING } from "../../../src/config";
import { ANY_MESSAGE_ERROR, BENEFICIAL_OWNER_HEADING, CONTINUE_BUTTON_TEXT, NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENT, NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE, NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE, NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT, SERVICE_UNAVAILABLE, UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS } from "../../__mocks__/text.mock";
import { OverseasEntityKey, Transactionkey } from "../../../src/model/data.types.model";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

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
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page with contact details section and beneficial owner statements`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENT);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page overseas entity details section`, async () => {
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_SECTION_HEADING);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("SA000392");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page beneficial owner section is not rendered if no BO data`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_HEADING);
      expect(resp.text).not.toContain("Beneficial owners");
      expect(resp.text).not.toContain("Individual beneficial owner");
    });

    test(`renders the ${UPDATE_REVIEW_STATEMENT_PAGE} page managing officer section is not rendered if no MO data`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Managing officers");
      expect(resp.text).not.toContain("Individual managing officer");
      expect(resp.text).not.toContain("Corporate managing officer");
    });

    test(`that the ${UPDATE_REVIEW_STATEMENT_PAGE} page managing officer section is rendered if MO data exists`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA
      });

      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Managing officers");
      expect(resp.text).toContain("Individual managing officer");
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${PAYMENT_LINK_JOURNEY}, with transaction and OE id`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      await request(app).post(UPDATE_REVIEW_STATEMENT_URL);

      // assertions dependent on UAR-587

      // expect(resp.status).toEqual(302);
      // expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`redirect to ${PAYMENT_LINK_JOURNEY}, if Save and Resume not enabled`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const mockData = { ...APPLICATION_DATA_UPDATE_BO_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      await request(app).post(UPDATE_REVIEW_STATEMENT_URL);

      // assertions dependent on UAR-587

      // expect(resp.status).toEqual(302);
      // expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`catch error on POST action for ${UPDATE_REVIEW_STATEMENT_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      mockCloseTransaction.mockImplementation(() => {
        throw ERROR;
      });
      const resp = await request(app).post(UPDATE_REVIEW_STATEMENT_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
