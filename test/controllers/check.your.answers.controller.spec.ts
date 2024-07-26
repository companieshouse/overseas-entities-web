jest.mock("ioredis");
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/service/payment.service');
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";

import {
  BENEFICIAL_OWNER_GOV_URL,
  BENEFICIAL_OWNER_INDIVIDUAL_URL,
  BENEFICIAL_OWNER_OTHER_URL,
  BENEFICIAL_OWNER_STATEMENTS_URL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  CHECK_YOUR_ANSWERS_PAGE,
  CHECK_YOUR_ANSWERS_URL,
  CONFIRMATION_PAGE,
  CONFIRMATION_URL,
  LANDING_PAGE_URL,
  MANAGING_OFFICER_CORPORATE_URL,
  MANAGING_OFFICER_URL,
  TRUST_DETAILS_URL,
  CHECK_YOUR_ANSWERS_WITH_PARAMS_URL
} from "../../src/config";

import * as CHANGE_LINKS from "../../src/config";

import {
  AGENT_REGISTERING,
  BENEFICIAL_OWNER_TYPE_LINK,
  CHANGE_LINK,
  CHANGE_LINK_INDIVIDUAL_BO_DOB,
  CHANGE_LINK_INDIVIDUAL_BO_FIRST_NAME,
  CHANGE_LINK_INDIVIDUAL_BO_HOME_ADDRESS,
  CHANGE_LINK_INDIVIDUAL_BO_IS_ON_SANCTIONS_LIST,
  CHANGE_LINK_INDIVIDUAL_BO_LAST_NAME,
  CHANGE_LINK_INDIVIDUAL_BO_NATIONALITY,
  CHANGE_LINK_INDIVIDUAL_BO_NOC,
  CHANGE_LINK_INDIVIDUAL_BO_SECOND_NATIONALITY,
  CHANGE_LINK_INDIVIDUAL_BO_SERVICE_ADDRESS,
  CHANGE_LINK_INDIVIDUAL_BO_START_DATE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_GOV_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_OLE_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_SUB_TEXT,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_CORPORATE_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_SUB_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_MANAGING_OFFICER_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_TITLE,
  CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE,
  FOUND_REDIRECT_TO,
  VERIFICATION_CHECKS,
  VERIFICATION_CHECKS_DATE,
  VERIFICATION_CHECKS_PERSON,
  PRINT_BUTTON_TEXT,
  SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT,
  SERVICE_UNAVAILABLE,
  SOMEONE_ELSE_REGISTERING,
  TRUST_INFORMATION_LINK,
  CHANGE_LINK_BO_OTHER,
  CHANGE_LINK_BO_GOVERNMENT,
  CHANGE_LINK_BO_INDIVIDUAL,
  CHANGE_LINK_MO_INDIVIDUAL,
  CHANGE_LINK_MO_CORPORATE,
  BACK_BUTTON_CLASS,
  TRUST_INVOLVED
} from "../__mocks__/text.mock";
import {
  ERROR,
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_NO_TRUSTS_MOCK,
  ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS,
  TRANSACTION_CLOSED_RESPONSE,
  PAYMENT_LINK_JOURNEY,
  BO_IND_ID_URL,
  BO_OTHER_ID_URL,
  BO_GOV_ID_URL,
  MO_IND_ID_URL,
  MO_CORP_ID_URL,
  PUBLIC_REGISTER_NAME,
  PUBLIC_REGISTER_JURISDICTION,
  REGISTRATION_NUMBER,
  TRUST_WITH_ID,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  MANAGING_OFFICER_OBJECT_MOCK,
  OVERSEAS_NAME_MOCK,
  TRANSACTION_ID,
  OVERSEAS_ENTITY_ID,
} from "../__mocks__/session.mock";

import { authentication } from "../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { startPaymentsSession } from "../../src/service/payment.service";
import { getApplicationData } from "../../src/utils/application.data";
import { postTransaction, closeTransaction } from "../../src/service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../src/service/overseas.entities.service";

import { dueDiligenceType, entityType, overseasEntityDueDiligenceType } from "../../src/model";
import { hasBOsOrMOs } from "../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware";
import { DUE_DILIGENCE_OBJECT_MOCK } from "../__mocks__/due.diligence.mock";
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from "../__mocks__/overseas.entity.due.diligence.mock";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";
import { ManagingOfficerKey } from "../../src/model/managing.officer.model";
import { TrustKey } from "../../src/model/trust.model";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
mockRemoveJourneyMiddleware.mockClear();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue( false );

const mockHasBOsOrMOsMiddleware = hasBOsOrMOs as jest.Mock;
mockHasBOsOrMOsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockOverseasEntity = createOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( CONFIRMATION_URL );

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
const MOCKED_URL = "MOCKED_URL";
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

describe("GET tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including presenter details`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("user@domain.roe");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
    expect(resp.text).toContain("legalForm");
    expect(resp.text).toContain("Joe Bloggs");
    expect(resp.text).toContain("jbloggs@bloggs.co.ru");
    expect(resp.text).toContain(CHANGE_LINK_BO_INDIVIDUAL);
    expect(resp.text).toContain(CHANGE_LINK_BO_GOVERNMENT);
    expect(resp.text).toContain(CHANGE_LINK_BO_OTHER);
    expect(resp.text).toContain(CHANGE_LINK_MO_INDIVIDUAL);
    expect(resp.text).toContain(CHANGE_LINK_MO_CORPORATE);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including print button`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(PRINT_BUTTON_TEXT);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(CHANGE_LINK);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.PRESENTER_CHANGE_FULL_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.PRESENTER_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_COUNTRY);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PRINCIPAL_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_CORRESPONDENCE_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_LEGAL_FORM);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_GOVERNING_LAW);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PUBLIC_REGISTER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_WHO);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_AML_NUMBER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_AGENT_CODE);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_PARTNER_NAME);
    expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_URL); // Change link for Statements
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Individual no second nationality`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerGovKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_FIRST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_LAST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_DOB);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NATIONALITY);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).not.toContain(CHANGE_LINK_INDIVIDUAL_BO_SECOND_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_HOME_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SERVICE_ADDRESS);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_START_DATE);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NOC);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_IS_ON_SANCTIONS_LIST);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Individual with second nationality`, async () => {
    const boIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK };
    boIndividual.second_nationality = "Swedish";

    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [ boIndividual ],
      [BeneficialOwnerGovKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_FIRST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_LAST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_DOB);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SECOND_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_HOME_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SERVICE_ADDRESS);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_START_DATE);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NOC);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_IS_ON_SANCTIONS_LIST);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Other legal entity`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [],
      [BeneficialOwnerGovKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.IS_ON_SANCTIONS_LIST}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Gov`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.IS_ON_SANCTIONS_LIST}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Individual no second nationality`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FORMER_NAMES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_USUAL_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).not.toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.OCCUPATION}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Individual with second nationality`, async () => {
    const moIndividual = { ...MANAGING_OFFICER_OBJECT_MOCK };
    moIndividual.second_nationality = "Swedish";
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: [moIndividual]
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FORMER_NAMES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_USUAL_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.OCCUPATION}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Corporate`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.PUBLIC_REGISTER_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CONTACT_FULL_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CONTACT_EMAIL}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with someone else change links when this is selected`, async () => {
    const applicationData = { APPLICATION_DATA_MOCK };
    applicationData[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationData);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(CHANGE_LINK);

    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PUBLIC_REGISTER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_WHO);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including identity checks - Agent (The UK-regulated agent) selected`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(VERIFICATION_CHECKS);
    expect(resp.text).toContain(VERIFICATION_CHECKS_DATE);
    expect(resp.text).toContain(VERIFICATION_CHECKS_PERSON);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.name);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.email);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.aml_number);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.agent_code);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.partner_name);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including identity checks - OE (Someone else) selected`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [dueDiligenceType.DueDiligenceKey]: {},
      [overseasEntityDueDiligenceType.OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
      [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(VERIFICATION_CHECKS);
    expect(resp.text).toContain(VERIFICATION_CHECKS_DATE);
    expect(resp.text).toContain(VERIFICATION_CHECKS_PERSON);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page (entity service address not same as principal address)`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempEntity = APPLICATION_DATA_MOCK[entityType.EntityKey];
    APPLICATION_DATA_MOCK[entityType.EntityKey] = ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[entityType.EntityKey] = tempEntity;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
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

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with trust data and feature flags are set to off`, async () => {
    // set FEATURE_FLAG_ENABLE_TRUSTS_WEB and FEATURE_FLAG_ENABLE_REDIS_REMOVAL to OFF
    mockIsActiveFeature.mockReturnValue(false);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(false);

    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_LINK); // back button
    expect(resp.text).toContain(TRUST_INFORMATION_LINK); // back button
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    expect(resp.text).not.toContain(TRUST_INVOLVED);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with trust data and feature flags set to on`, async () => {
    // set FEATURE_FLAG_ENABLE_TRUSTS_WEB and FEATURE_FLAG_ENABLE_REDIS_REMOVAL to ON
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);

    APPLICATION_DATA_MOCK.entity_number = undefined;
    const mockAppData = {
      ...APPLICATION_DATA_MOCK,
      [TrustKey]: [
        TRUST_WITH_ID,
      ]
    };

    mockGetApplicationData.mockReturnValueOnce(mockAppData);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_LINK); // back button
    expect(resp.text).toContain(MOCKED_URL); // back button
    expect(resp.text).toContain(BACK_BUTTON_CLASS); // back button
    expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL}`);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    expect(resp.text).toContain(`${TRUST_DETAILS_URL}/${TRUST_WITH_ID.trust_id}`);
    expect(resp.text).toContain(TRUST_WITH_ID.trust_name);
    expect(resp.text).toMatch(/31\s+December\s+1999/m);
    expect(resp.text).not.toContain(TRUST_INVOLVED);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with no trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LINK); // continue button
    expect(resp.text).not.toContain(TRUST_INFORMATION_LINK); // back button
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with empty trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_NO_TRUSTS_MOCK,
      [TrustKey]: []
    });

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LINK);
    expect(resp.text).not.toContain(TRUST_INFORMATION_LINK);
    expect(resp.text).not.toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    expect(resp.text).not.toContain(TRUST_INVOLVED);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE}`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);

    // Overseas name
    expect(resp.text).toContain(OVERSEAS_NAME_MOCK);

    // Beneficial Owner Individual
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
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_OLE_SUB_TITLE);
    expect(resp.text).toContain("TestCorporation");
    expect(resp.text).toContain("TheLegalForm");
    expect(resp.text).toContain("November");
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

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with identity check by uk agent`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(AGENT_REGISTERING);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with identity check by someone else`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(SOMEONE_ELSE_REGISTERING);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with all three public register fields`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PUBLIC_REGISTER_NAME + " / " + PUBLIC_REGISTER_JURISDICTION + " / " + REGISTRATION_NUMBER);
    expect(resp.text).toContain(SOMEONE_ELSE_REGISTERING);
  });
});

describe("GET with url params tests tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including presenter details`, async () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("user@domain.roe");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
    expect(resp.text).toContain("legalForm");
    expect(resp.text).toContain("Joe Bloggs");
    expect(resp.text).toContain("jbloggs@bloggs.co.ru");
    expect(resp.text).toContain(CHANGE_LINK_BO_INDIVIDUAL);
    expect(resp.text).toContain(CHANGE_LINK_BO_GOVERNMENT);
    expect(resp.text).toContain(CHANGE_LINK_BO_OTHER);
    expect(resp.text).toContain(CHANGE_LINK_MO_INDIVIDUAL);
    expect(resp.text).toContain(CHANGE_LINK_MO_CORPORATE);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including print button`, async () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(PRINT_BUTTON_TEXT);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links`, async () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(CHANGE_LINK);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.PRESENTER_CHANGE_FULL_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.PRESENTER_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_COUNTRY);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PRINCIPAL_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_CORRESPONDENCE_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_LEGAL_FORM);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_GOVERNING_LAW);
    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PUBLIC_REGISTER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_WHO);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_AML_NUMBER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_AGENT_CODE);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_PARTNER_NAME);
    expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_URL); // Change link for Statements
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Individual no second nationality`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerGovKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_FIRST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_LAST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_DOB);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NATIONALITY);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).not.toContain(CHANGE_LINK_INDIVIDUAL_BO_SECOND_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_HOME_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SERVICE_ADDRESS);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_START_DATE);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NOC);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_IS_ON_SANCTIONS_LIST);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Individual with second nationality`, async () => {
    const boIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK };
    boIndividual.second_nationality = "Swedish";

    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [ boIndividual ],
      [BeneficialOwnerGovKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_FIRST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_LAST_NAME);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_DOB);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SECOND_NATIONALITY);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_HOME_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_SERVICE_ADDRESS);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_START_DATE);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_NOC);
    expect(resp.text).toContain(CHANGE_LINK_INDIVIDUAL_BO_IS_ON_SANCTIONS_LIST);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Other legal entity`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [],
      [BeneficialOwnerGovKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.IS_ON_SANCTIONS_LIST}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links BO Gov`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [],
      [BeneficialOwnerOtherKey]: []
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_INDIVIDUAL_URL}${BO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).not.toContain(`${BENEFICIAL_OWNER_OTHER_URL}${BO_OTHER_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.START_DATE}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.NOC_TYPES}`);
    expect(resp.text).toContain(`${BENEFICIAL_OWNER_GOV_URL}${BO_GOV_ID_URL}${CHANGE_LINKS.IS_ON_SANCTIONS_LIST}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Individual no second nationality`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FORMER_NAMES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_USUAL_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).not.toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.OCCUPATION}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Individual with second nationality`, async () => {
    const moIndividual = { ...MANAGING_OFFICER_OBJECT_MOCK };
    moIndividual.second_nationality = "Swedish";
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: [moIndividual]
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FIRST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.LAST_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.FORMER_NAMES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.CHANGE_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_USUAL_RESIDENTIAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.DATE_OF_BIRTH}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.SECOND_NATIONALITY}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.OCCUPATION}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_URL}${MO_IND_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including change links MO Corporate`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CHANGE_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.IS_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.LEGAL_FORM}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.LAW_GOVERNED}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.PUBLIC_REGISTER_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.ROLE_AND_RESPONSIBILITIES}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CONTACT_FULL_NAME}`);
    expect(resp.text).toContain(`${MANAGING_OFFICER_CORPORATE_URL}${MO_CORP_ID_URL}${CHANGE_LINKS.CONTACT_EMAIL}`);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with someone else change links when this is selected`, async () => {
    const applicationData = { APPLICATION_DATA_MOCK };
    applicationData[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationData);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(LANDING_PAGE_URL);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(CHANGE_LINK);

    expect(resp.text).toContain(CHANGE_LINKS.ENTITY_CHANGE_PUBLIC_REGISTER);
    expect(resp.text).toContain(CHANGE_LINKS.DUE_DILIGENCE_CHANGE_WHO);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER);
    expect(resp.text).toContain(CHANGE_LINKS.OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including identity checks - Agent (The UK-regulated agent) selected`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(VERIFICATION_CHECKS);
    expect(resp.text).toContain(VERIFICATION_CHECKS_DATE);
    expect(resp.text).toContain(VERIFICATION_CHECKS_PERSON);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.name);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.email);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.aml_number);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.agent_code);
    expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.partner_name);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page including identity checks - OE (Someone else) selected`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [dueDiligenceType.DueDiligenceKey]: {},
      [overseasEntityDueDiligenceType.OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
      [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE
    });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(VERIFICATION_CHECKS);
    expect(resp.text).toContain(VERIFICATION_CHECKS_DATE);
    expect(resp.text).toContain(VERIFICATION_CHECKS_PERSON);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
    expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page (entity service address not same as principal address)`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempEntity = APPLICATION_DATA_MOCK[entityType.EntityKey];
    APPLICATION_DATA_MOCK[entityType.EntityKey] = ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);
    APPLICATION_DATA_MOCK[entityType.EntityKey] = tempEntity;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain("serviceAddressLine1");
    expect(resp.text).toContain("SBY 2");
    expect(resp.text).toContain("legalForm");
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page (entity service address same as principal address)`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with trust data and feature flag off`, async () => {
    mockIsActiveFeature.mockReturnValue(false); // FEATURE_FLAG_ENABLE_TRUSTS_WEB flag

    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_LINK); // back button
    expect(resp.text).toContain(TRUST_INFORMATION_LINK); // back button
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with trust data and feature flags set to on`, async () => {
    // set FEATURE_FLAG_ENABLE_TRUSTS_WEB and FEATURE_FLAG_ENABLE_REDIS_REMOVAL to ON
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockIsActiveFeature.mockReturnValueOnce(true);

    APPLICATION_DATA_MOCK.entity_number = undefined;
    const mockAppData = {
      ...APPLICATION_DATA_MOCK,
      [TrustKey]: [
        TRUST_WITH_ID,
      ]
    };

    mockGetApplicationData.mockReturnValueOnce(mockAppData);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_LINK); // back button
    expect(resp.text).toContain(MOCKED_URL); // back button
    expect(resp.text).toContain(BACK_BUTTON_CLASS); // back button
    expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL}`);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    expect(resp.text).toContain(`${TRUST_DETAILS_URL}/${TRUST_WITH_ID.trust_id}`);
    expect(resp.text).toContain(TRUST_WITH_ID.trust_name);
    expect(resp.text).toMatch(/31\s+December\s+1999/m);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with no trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LINK); // continue button
    expect(resp.text).not.toContain(TRUST_INFORMATION_LINK); // back button
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with empty trust data`, async () => {
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_NO_TRUSTS_MOCK,
      [TrustKey]: []
    });

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LINK);
    expect(resp.text).not.toContain(TRUST_INFORMATION_LINK);
    expect(resp.text).not.toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE}`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);

    // Overseas name
    expect(resp.text).toContain(OVERSEAS_NAME_MOCK);

    // Beneficial Owner Individual
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
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_OLE_SUB_TITLE);
    expect(resp.text).toContain("TestCorporation");
    expect(resp.text).toContain("TheLegalForm");
    expect(resp.text).toContain("November");
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
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with identity check by uk agent`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(AGENT_REGISTERING);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with identity check by someone else`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(SOMEONE_ELSE_REGISTERING);
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page with all three public register fields`, async () => {
    const applicationDataWithSomeoneElse = { ...APPLICATION_DATA_MOCK };
    applicationDataWithSomeoneElse[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    mockGetApplicationData.mockReturnValueOnce(applicationDataWithSomeoneElse);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PUBLIC_REGISTER_NAME + " / " + PUBLIC_REGISTER_JURISDICTION + " / " + REGISTRATION_NUMBER);
    expect(resp.text).toContain(SOMEONE_ELSE_REGISTERING);
  });
});

describe("POST tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`redirect the ${CONFIRMATION_PAGE} page after fetching transaction and OE id from appData`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
  });

  test(`redirect to ${PAYMENT_LINK_JOURNEY}, the first Payment web journey page, after fetching transaction and OE id from appData`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${PAYMENT_LINK_JOURNEY}`);
    expect(mockUpdateOverseasEntity).toBeCalledTimes(1);
    expect(mockCloseTransaction).toBeCalledTimes(1);
    expect(mockPaymentsSession).toBeCalledTimes(1);
  });

  test(`catch error when post data from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    mockGetApplicationData.mockImplementation(() => {
      throw ERROR;
    });
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});

describe("POST with url param tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`redirect the ${CONFIRMATION_PAGE} page after fetching transaction and OE id from appData`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
  });

  test(`redirect to ${PAYMENT_LINK_JOURNEY}, the first Payment web journey page, after fetching transaction and OE id from appData`, async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${PAYMENT_LINK_JOURNEY}`);
    expect(mockUpdateOverseasEntity).toBeCalledTimes(1);
    expect(mockCloseTransaction).toBeCalledTimes(1);
    expect(mockPaymentsSession).toBeCalledTimes(1);
  });

  test(`catch error when post data from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    mockGetApplicationData.mockImplementation(() => {
      throw ERROR;
    });
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
