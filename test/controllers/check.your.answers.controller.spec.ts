jest.mock("ioredis");
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/service/payment.service');
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import {
  CHECK_YOUR_ANSWERS_PAGE,
  CHECK_YOUR_ANSWERS_URL,
  CONFIRMATION_PAGE,
  CONFIRMATION_URL,
} from "../../src/config";
import {
  BENEFICIAL_OWNER_TYPE_LINK,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_GOV_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_OTHER_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_SUB_TEXT,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_CORPORATE_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_TITLE,
  FOUND_REDIRECT_TO,
  SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT,
  SERVICE_UNAVAILABLE,
  TRUST_INFORMATION_LINK,
} from "../__mocks__/text.mock";
import {
  ERROR,
  OVERSEAS_ENTITY_ID,
  TRANSACTION,
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_NO_TRUSTS_MOCK,
  ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS,
  TRANSACTION_CLOSED_RESPONSE,
  PAYMENT_LINK_JOURNEY,
} from "../__mocks__/session.mock";

import { authentication } from "../../src/middleware/authentication.middleware";
import { postTransaction, closeTransaction } from "../../src/service/transaction.service";
import { createOverseasEntity } from "../../src/service/overseas.entities.service";
import { startPaymentsSession } from "../../src/service/payment.service";
import { getApplicationData } from "../../src/utils/application.data";

import { entityType } from "../../src/model";
import { hasBOsOrMOs } from "../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware";

const mockHasBOsOrMOsMiddleware = hasBOsOrMOs as jest.Mock;
mockHasBOsOrMOsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( { httpStatusCode: 201, resource: TRANSACTION } );

const mockOverseasEntity = createOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( { id: OVERSEAS_ENTITY_ID } );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( CONFIRMATION_URL );

describe("GET tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including presenter details`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("user@domain.roe");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
    expect(resp.text).toContain("legalForm");
    expect(resp.text).toContain("Joe Bloggs");
    expect(resp.text).toContain("jbloggs@bloggs.co.ru");
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page (entity service address not same as principal address)`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempEntity = APPLICATION_DATA_MOCK[entityType.EntityKey];
    APPLICATION_DATA_MOCK[entityType.EntityKey] = ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[entityType.EntityKey] = tempEntity;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain("serviceAddressLine1");
    expect(resp.text).toContain("SBY 2");
    expect(resp.text).toContain("legalForm");
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page (entity service address same as principal address)`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_LINK); // back button
    expect(resp.text).toContain(TRUST_INFORMATION_LINK); // back button
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with no trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LINK); // continue button
    expect(resp.text).not.toContain(TRUST_INFORMATION_LINK); // back button
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE}`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);

    // Beneficial Owner Individual
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("Ivan");
    expect(resp.text).toContain("Drago");
    expect(resp.text).toContain("March");
    expect(resp.text).toContain("Russian");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("addressLine2");
    expect(resp.text).toContain("town");
    expect(resp.text).toContain("county");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain("1999");
    expect(resp.text).toContain("Holds, directly or indirectly, more than 25% of the shares in the entity");
    expect(resp.text).toContain("The trustees of that trust (in their capacity as such) hold, directly or indirectly, more than 25% of the voting rights in the entity");
    expect(resp.text).toContain("The members of that firm (in their capacity as such) hold the right, directly or indirectly, to appoint or remove a majority of the board of directors of the company");

    // Beneficial Owner Statement
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_SUB_TEXT);

    // Beneficial Owner Other
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_OTHER_SUB_TITLE);
    expect(resp.text).toContain("TestCorporation");
    expect(resp.text).toContain("TheLegalForm");
    // expect(resp.text).toContain("January");
    expect(resp.text).toContain("TheLaw");
    expect(resp.text).toContain("Russian");
    expect(resp.text).toContain("ThisRegister / 123456789");

    // Beneficial Owner Gov
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_GOV_SUB_TITLE);
    expect(resp.text).toContain("my company name");
    expect(resp.text).toContain("LegalForm");
    expect(resp.text).toContain("a11");
    expect(resp.text).toContain("November");
    expect(resp.text).toContain("1965");

    // Managing Officer Individual
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_TITLE);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_SUB_TITLE);
    expect(resp.text).toContain("Joe");
    expect(resp.text).toContain("Bloggs");
    expect(resp.text).toContain("Malawian");
    expect(resp.text).toContain("Some Occupation");
    expect(resp.text).toContain("Some role and responsibilities");

    // Managing Officer Corporate
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_CORPORATE_SUB_TITLE);
    expect(resp.text).toContain("Joe Bloggs Ltd");
    expect(resp.text).toContain("register / 123456789");
    expect(resp.text).toContain("role and responsibilities text");
  });

  test("catch error when getting data", async () => {
    mockGetApplicationData.mockImplementationOnce(() => {
      throw ERROR;
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});

describe("POST tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`redirect the ${CONFIRMATION_PAGE} page after a successful post from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
  });

  test(`redirect to ${PAYMENT_LINK_JOURNEY}, the first Payment web journey page`, async () => {
    mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${PAYMENT_LINK_JOURNEY}`);
  });

  test(`catch error when post data from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    mockOverseasEntity.mockImplementation(() => {
      throw ERROR;
    });
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
