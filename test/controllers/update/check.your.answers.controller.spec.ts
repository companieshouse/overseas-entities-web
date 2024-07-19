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
jest.mock("../../../src/utils/feature.flag");
jest.mock('../../../src/middleware/statement.validation.middleware');
jest.mock("../../../src/utils/date");

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { validateStatements, summaryPagesGuard } from "../../../src/middleware/statement.validation.middleware";

import {
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_PRESENTER_CHANGE_FULL_NAME,
  UPDATE_PRESENTER_CHANGE_EMAIL,
  SECURE_UPDATE_FILTER_URL,
  REMOVE_SERVICE_NAME,
  REMOVE_CONFIRM_STATEMENT_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_DUE_DILIGENCE_CHANGE_AGENT_CODE,
} from "../../../src/config";
import app from "../../../src/app";
import {
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  ANY_MESSAGE_ERROR,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE,
  UPDATE_CHECK_YOUR_ANSWERS_BACK_LINK,
  CHANGE_LINK,
  CHANGE_LINK_ENTITY_NAME,
  CHANGE_LINK_ENTITY_EMAIL,
  CHANGE_LINK_ENTITY_GOVERNING_LAW,
  CHANGE_LINK_ENTITY_LEGAL_FORM,
  CHANGE_LINK_ENTITY_PRINCIPAL_ADDRESS,
  CHANGE_LINK_ENTITY_SERVICE_ADDRESS,
  VERIFICATION_CHECKS,
  VERIFICATION_CHECKS_DATE,
  VERIFICATION_CHECKS_PERSON,
  UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS,
  UPDATE_CHECK_YOUR_ANSWERS_WHO_CAN_WE_CONTACT,
  UPDATE_CHANGE_LINK_NEW_BO_INDIVIDUAL,
  UPDATE_CHANGE_LINK_NEW_BO_GOVERNMENT,
  UPDATE_CHANGE_LINK_NEW_BO_OTHER,
  UPDATE_CHANGE_LINK_NEW_MO_INDIVIDUAL,
  UPDATE_CHANGE_LINK_NEW_MO_CORPORATE,
  CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE,
  UPDATE_CHANGE_LINK_REVIEWED_BO_INDIVIDUAL,
  UPDATE_CHANGE_LINK_REVIEWED_BO_GOVERNMENT,
  UPDATE_CHANGE_LINK_REVIEWED_BO_OTHER,
  CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE,
  UPDATE_CHECK_YOUR_ANSWERS_WITH_STATEMENT_VALIDATION_BACK_LINK,
  HOME_ADDRESS_LINE1,
  CHECK_YOUR_ANSWERS_PAGE_TITLE,
  REMOVE_CHECK_YOUR_ANSWERS_PAGE_TITLE,
  REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE,
  CONTINUE_BUTTON_TEXT,
  PRINT_BUTTON_TEXT,
  REMOVE_SECURE_FILTER_PAGE_HEADING,
  REMOVE_STATEMENT_DECLARATION,
  REMOVE_SOLD_ALL_LAND_CHANGE_LINK,
  REMOVE_IS_OE_REGISTERED_OWNER_CHANGE_LINK,
  REMOVE_SECURE_REGISTER_CHANGE_LINK,
  REMOVE_CHECK_YOUR_ANSWERS_BACK_LINK,
  TRUST_NAME,
  TRUST_CREATION_DATE,
  TRUSTS_ADDED,
  TRUSTS_REVIEWED,
  TRUST_INVOLVED,
  TRUST_CEASED_DATE,
  TRUSTEE_INDIVIDUAL_TITLE,
  TRUSTEE_LEGAL_ENTITY_TITLE,
  TRUSTEE_INDIVIDUAL_FIRSTNAME,
  TRUSTEE_INDIVIDUAL_LASTNAME,
  TRUSTEE_INDIVIDUAL_DATE_OF_BIRTH,
  TRUSTEE_INDIVIDUAL_NATIONALITY,
  TRUSTEE_ROLE,
  TRUSTEE_LEGAL_ENTITY_NAME,
  TRUSTEE_LEGAL_ENTITY_LEGAL_AUTHORITY,
  TRUSTEE_LEGAL_ENTITY_LEGAL_FORM,
  TRUSTEE_INDIVIDUAL_INVOLVED,
  TRUSTEE_LEGAL_ENTITY_INVOLVED,
  TRUSTEE_INDIVIDUAL_CEASED_DATE,
  TRUSTEE_LEGAL_ENTITY_CEASED_DATE
} from "../../__mocks__/text.mock";
import {
  ERROR,
  OVERSEAS_ENTITY_ID,
  APPLICATION_DATA_UPDATE_BO_MOCK,
  APPLICATION_DATA_CH_REF_UPDATE_MOCK,
  TRANSACTION_CLOSED_RESPONSE,
  PAYMENT_LINK_JOURNEY,
  TRANSACTION_ID,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
  UPDATE_MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF,
  APPLICATION_DATA_REMOVE_BO_MOCK,
  APPLICATION_DATA_CH_REF_REMOVE_MOCK,
  OVERSEAS_NAME_MOCK,
  COMPANY_NUMBER,
  INDIVIUAL_TRUSTEE,
  CORPORATE_TRUSTEE,
  TRUST_WITH_ID,
} from "../../__mocks__/session.mock";
import { DUE_DILIGENCE_OBJECT_MOCK } from "../../__mocks__/due.diligence.mock";
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from "../../__mocks__/overseas.entity.due.diligence.mock";
import {
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER,
  UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME,
  UPDATE_DUE_DILIGENCE_CHANGE_WHO,
  UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_DATE,
  UPDATE_DUE_DILIGENCE_CHANGE_NAME,
  UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS,
  UPDATE_DUE_DILIGENCE_CHANGE_EMAIL,
  UPDATE_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME,
  UPDATE_DUE_DILIGENCE_CHANGE_AML_NUMBER,
  UPDATE_DUE_DILIGENCE_CHANGE_PARTNER_NAME,
} from "../../../src/config";

import { InputDate, OverseasEntityKey, Transactionkey } from '../../../src/model/data.types.model';
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { postTransaction, closeTransaction } from "../../../src/service/transaction.service";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { startPaymentsSession } from "../../../src/service/payment.service";
import { getApplicationData } from "../../../src/utils/application.data";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { dueDiligenceType, managingOfficerType, overseasEntityDueDiligenceType } from "../../../src/model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../../src/model/who.is.making.filing.model";
import { hasBOsOrMOsUpdate } from "../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware";
import { BeneficialOwnerIndividualKey } from "../../../src/model/beneficial.owner.individual.model";
import { BeneficialOwnerGovKey } from "../../../src/model/beneficial.owner.gov.model";
import { ADDRESS } from "../../__mocks__/fields/address.mock";
import { BeneficialOwnerOtherKey } from "../../../src/model/beneficial.owner.other.model";
import { getTodaysDate } from "../../../src/utils/date";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasBOsOrMOsUpdateMiddleware = hasBOsOrMOsUpdate as jest.Mock;
mockHasBOsOrMOsUpdateMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockValidateStatements = validateStatements as jest.Mock;
mockValidateStatements.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockSummaryPagesGuard = summaryPagesGuard as jest.Mock;
mockSummaryPagesGuard.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockOverseasEntity = updateOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( "CONFIRMATION_URL" );

const mockGetTodaysDate = getTodaysDate as jest.Mock;

describe("CHECK YOUR ANSWERS controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockValidateStatements.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
    mockSummaryPagesGuard.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
    mockGetTodaysDate.mockReturnValue({ day: "5", month: "4", year: "2024" } as InputDate);
  });

  describe("GET tests", () => {
    test('runs summaryPagesGuard middleware', async () => {
      mockValidateStatements.mockImplementation((req: Request, _: Response, next: NextFunction) => {
        req['statementErrorList'] = ["There are no active registrable beneficial owners."];
        next();
      });

      mockSummaryPagesGuard.mockImplementation((_: Request, res: Response, __: NextFunction) => {
        res.redirect(SECURE_UPDATE_FILTER_URL);
      });

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(SECURE_UPDATE_FILTER_URL);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK, REMOVE_CONFIRM_STATEMENT_URL],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK, UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with contact details section %s`, async (_journeyType, mockAppData, backLink) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(backLink);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_GOVERNMENT);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_OTHER);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_CORPORATE);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK ],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK ]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} with statement validation on and trusts flag on with trust details section %s`, async (_journeyType, mockAppData) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_WITH_STATEMENT_VALIDATION_BACK_LINK);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_GOVERNMENT);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_OTHER);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_CORPORATE);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK, REMOVE_CONFIRM_STATEMENT_URL],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK, UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} with statement validation off and trusts flag on with trust details section %s`, async (_journeyType, mockAppData, backLink) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(false);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(backLink);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_GOVERNMENT);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_BO_OTHER);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_NEW_MO_CORPORATE);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TRUST_TITLE);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_CH_REF_REMOVE_MOCK, REMOVE_CONFIRM_STATEMENT_URL],
      ["on update journey", APPLICATION_DATA_CH_REF_UPDATE_MOCK, UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with contact details section with (ceased) existing BO %s`, async (_journeyType, mockAppData, backLink) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(backLink);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_WHO_CAN_WE_CONTACT);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_FULL_NAME);
      expect(resp.text).toContain(UPDATE_PRESENTER_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_REVIEWED_BO_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_REVIEWED_BO_GOVERNMENT);
      expect(resp.text).toContain(UPDATE_CHANGE_LINK_REVIEWED_BO_OTHER);
      expect(resp.text).toContain(HOME_ADDRESS_LINE1);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK, REMOVE_CHECK_YOUR_ANSWERS_PAGE_TITLE, REMOVE_CONFIRM_STATEMENT_URL],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK, CHECK_YOUR_ANSWERS_PAGE_TITLE, UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page %s`, async (_journeyType, mockAppData, pageTitle, backLink) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(pageTitle);
      expect(resp.text).toContain(backLink);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_NAME);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_SERVICE_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_EMAIL);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_LEGAL_FORM);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_GOVERNING_LAW);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK ],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK ]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with verification checks - Agent selected %s`, async (_journeyType, mockAppData) => {
      mockGetApplicationData.mockReturnValue(mockAppData);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

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

      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_WHO);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_NAME);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_AML_NUMBER);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_PARTNER_NAME);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_AGENT_CODE);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_REMOVE_BO_MOCK ],
      ["on update journey", APPLICATION_DATA_UPDATE_BO_MOCK ]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with verification checks - OE (Someone else) selected %s`, async (_journeyType, mockAppData) => {
      mockGetApplicationData.mockReturnValue({
        ...mockAppData,
        [dueDiligenceType.DueDiligenceKey]: {},
        [overseasEntityDueDiligenceType.OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
        [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE
      });
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(VERIFICATION_CHECKS);
      expect(resp.text).toContain(VERIFICATION_CHECKS_DATE);
      expect(resp.text).toContain(VERIFICATION_CHECKS_PERSON);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);

      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_CHANGE_WHO);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME);
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_CH_REF_REMOVE_MOCK ],
      ["on update journey", APPLICATION_DATA_CH_REF_UPDATE_MOCK ]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with private BO data displayed %s`, async (_journeyType, mockAppData) => {
      const updatedMockDataForBo = {
        ...mockAppData,
        [BeneficialOwnerIndividualKey]:
          [
            {
              ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
              usual_residential_address: { ...ADDRESS, line_1: "Private BO addressLine1" }
            },

          ],
        [BeneficialOwnerGovKey]:
          [
            {
              ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
              principal_address: { ...ADDRESS, line_1: "Private BO Gov Line1" }
            }
          ],
        [BeneficialOwnerOtherKey]:
          [
            {
              ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF,
              principal_address: { ...ADDRESS, line_1: "Private BO Other Line1" }
            }
          ]
      };

      mockGetApplicationData.mockReturnValue(updatedMockDataForBo);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Private BO addressLine1");
      expect(resp.text).toContain("Private BO Gov Line1");
      expect(resp.text).toContain("Private BO Other Line1");
    });

    test.each([
      ["on remove journey", APPLICATION_DATA_CH_REF_REMOVE_MOCK ],
      ["on update journey", APPLICATION_DATA_CH_REF_UPDATE_MOCK ]
    ])(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with private MO data displayed %s`, async (_journeyType, mockAppData) => {
      const updatedMockDataForMo = {
        ...mockAppData,
        [managingOfficerType.ManagingOfficerKey]:
          [
            {
              ...UPDATE_MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
              usual_residential_address: { ...ADDRESS, line_1: "Private MO addressLine1" }
            }
          ]
      };

      mockGetApplicationData.mockReturnValue(updatedMockDataForMo);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Private MO addressLine1");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with extra info for remove journey `, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_REMOVE_BO_MOCK);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).toContain("05");
      expect(resp.text).toContain("April");
      expect(resp.text).toContain("2024");
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(PRINT_BUTTON_TEXT);
      expect(resp.text).toContain(REMOVE_CONFIRM_STATEMENT_URL);
      expect(resp.text).toContain(REMOVE_SECURE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(REMOVE_STATEMENT_DECLARATION);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_CHANGE_LINK);
      expect(resp.text).toContain(REMOVE_IS_OE_REGISTERED_OWNER_CHANGE_LINK);
      expect(resp.text).toContain(REMOVE_SECURE_REGISTER_CHANGE_LINK);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(COMPANY_NUMBER);
      expect(resp.text).toContain(REMOVE_CHECK_YOUR_ANSWERS_BACK_LINK);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when an added trust is still involved in the overseas entity`, async () => {
      const trust = {
        trust_id: "123",
        trust_name: "wizzz trust",
        creation_date_day: "31",
        creation_date_month: "12",
        creation_date_year: "1999",
        trust_still_involved_in_overseas_entity: "Yes",
        unable_to_obtain_all_trust_info: "No"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [trust]
      };

      mockGetApplicationData.mockReturnValue(appData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_NAME);
      expect(resp.text).toContain("wizzz trust");
      expect(resp.text).toContain(TRUST_CREATION_DATE);
      expect(resp.text).toContain("31");
      expect(resp.text).toContain("December");
      expect(resp.text).toContain("1999");
      expect(resp.text).toContain(TRUSTS_ADDED);
      expect(resp.text).not.toContain(TRUSTS_REVIEWED);
      expect(resp.text).toContain(TRUST_INVOLVED);
      expect(resp.text).not.toContain(TRUST_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when an added trust is not still involved in the overseas entity`, async () => {
      const trust = {
        trust_id: "123",
        trust_name: "wizzz trust",
        creation_date_day: "31",
        creation_date_month: "12",
        creation_date_year: "1999",
        trust_still_involved_in_overseas_entity: "No",
        ceased_date_day: "01",
        ceased_date_month: "02",
        ceased_date_year: "2004",
        unable_to_obtain_all_trust_info: "No"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [trust]
      };

      mockGetApplicationData.mockReturnValue(appData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_NAME);
      expect(resp.text).toContain("wizzz trust");
      expect(resp.text).toContain(TRUST_CREATION_DATE);
      expect(resp.text).toContain("31");
      expect(resp.text).toContain("December");
      expect(resp.text).toContain("1999");
      expect(resp.text).toContain(TRUSTS_ADDED);
      expect(resp.text).not.toContain(TRUSTS_REVIEWED);
      expect(resp.text).toContain(TRUST_INVOLVED);
      expect(resp.text).toContain(TRUST_CEASED_DATE);
      expect(resp.text).toContain("01");
      expect(resp.text).toContain("February");
      expect(resp.text).toContain("2004");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a reviewed trust is still involved in the overseas entity`, async () => {
      const trust = {
        trust_id: "123",
        ch_reference: "123", // marks out a review trust
        trust_name: "wizzz trust",
        creation_date_day: "31",
        creation_date_month: "12",
        creation_date_year: "1999",
        trust_still_involved_in_overseas_entity: "Yes",
        unable_to_obtain_all_trust_info: "No"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [trust]
      };

      mockGetApplicationData.mockReturnValue(appData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_NAME);
      expect(resp.text).toContain("wizzz trust");
      expect(resp.text).toContain(TRUST_CREATION_DATE);
      expect(resp.text).toContain("31");
      expect(resp.text).toContain("December");
      expect(resp.text).toContain("1999");
      expect(resp.text).toContain(TRUSTS_REVIEWED);
      expect(resp.text).not.toContain(TRUSTS_ADDED);
      expect(resp.text).toContain(TRUST_INVOLVED);
      expect(resp.text).not.toContain(TRUST_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a reviewed trust is not still involved in the overseas entity`, async () => {
      const trust = {
        trust_id: "123",
        ch_reference: "123", // marks out a review trust
        trust_name: "wizzz trust",
        creation_date_day: "31",
        creation_date_month: "12",
        creation_date_year: "1999",
        trust_still_involved_in_overseas_entity: "No",
        ceased_date_day: "01",
        ceased_date_month: "02",
        ceased_date_year: "2004",
        unable_to_obtain_all_trust_info: "No"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [trust]
      };

      mockGetApplicationData.mockReturnValue(appData);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_NAME);
      expect(resp.text).toContain("wizzz trust");
      expect(resp.text).toContain(TRUST_CREATION_DATE);
      expect(resp.text).toContain("31");
      expect(resp.text).toContain("December");
      expect(resp.text).toContain("1999");
      expect(resp.text).toContain(TRUSTS_REVIEWED);
      expect(resp.text).not.toContain(TRUSTS_ADDED);
      expect(resp.text).toContain(TRUST_INVOLVED);
      expect(resp.text).toContain(TRUST_CEASED_DATE);
      expect(resp.text).toContain("01");
      expect(resp.text).toContain("February");
      expect(resp.text).toContain("2004");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when an individual trustee is still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const trustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "Yes"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [trustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_FIRSTNAME);
      expect(resp.text).toContain("INDIE");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_LASTNAME);
      expect(resp.text).toContain("BENO");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_DATE_OF_BIRTH);
      expect(resp.text).toContain("16");
      expect(resp.text).toContain("August");
      expect(resp.text).toContain("1982");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_NATIONALITY);
      expect(resp.text).toContain("Bahraini");
      expect(resp.text).toContain(TRUSTEE_ROLE);
      expect(resp.text).toContain("Settlor");

      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);

      expect(resp.text).not.toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when an individual trustee is not still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const trustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "10",
        ceased_date_month: "5",
        ceased_date_year: "2024"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [trustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_FIRSTNAME);
      expect(resp.text).toContain("INDIE");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_LASTNAME);
      expect(resp.text).toContain("BENO");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_DATE_OF_BIRTH);
      expect(resp.text).toContain("16");
      expect(resp.text).toContain("August");
      expect(resp.text).toContain("1982");
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_NATIONALITY);
      expect(resp.text).toContain("Bahraini");
      expect(resp.text).toContain(TRUSTEE_ROLE);
      expect(resp.text).toContain("Settlor");

      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);

      expect(resp.text).not.toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("May");
      expect(resp.text).toContain("2024");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a corporate trustee is still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const trustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "Yes"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          CORPORATES: [trustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_NAME);
      expect(resp.text).toContain("Legal E trustee");
      expect(resp.text).toContain("Date Legal E trustee became an interested person");
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("9");
      expect(resp.text).toContain("2021");
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_LEGAL_AUTHORITY);
      expect(resp.text).toContain("GOVERNING LAW");
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_LEGAL_FORM);
      expect(resp.text).toContain("LEGAL FORM");
      expect(resp.text).toContain(TRUSTEE_ROLE);
      expect(resp.text).toContain("Interested_Person");

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);

      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).not.toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a corporate trustee is not still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const trustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "10",
        ceased_date_month: "5",
        ceased_date_year: "2024"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          CORPORATES: [trustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_NAME);
      expect(resp.text).toContain("Legal E trustee");
      expect(resp.text).toContain("Date Legal E trustee became an interested person");
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("9");
      expect(resp.text).toContain("2021");
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_LEGAL_AUTHORITY);
      expect(resp.text).toContain("GOVERNING LAW");
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_LEGAL_FORM);
      expect(resp.text).toContain("LEGAL FORM");
      expect(resp.text).toContain(TRUSTEE_ROLE);
      expect(resp.text).toContain("Interested_Person");

      expect(resp.text).not.toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_INVOLVED);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("May");
      expect(resp.text).toContain("2024");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a both types of trustee are still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const individualTrustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "Yes"
      };

      const coprorateTrustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "Yes"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [individualTrustee],
          CORPORATES: [coprorateTrustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);

      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when a both types of trustee are not still involved in the trust`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const individualTrustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "9",
        ceased_date_month: "4",
        ceased_date_year: "2023"
      };

      const coprorateTrustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "10",
        ceased_date_month: "5",
        ceased_date_year: "2024"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [individualTrustee],
          CORPORATES: [coprorateTrustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUSTEE_ROLE);

      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);
      expect(resp.text).toContain("9");
      expect(resp.text).toContain("April");
      expect(resp.text).toContain("2023");

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("May");
      expect(resp.text).toContain("2024");
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when individual trustee is not still involved in the trust, corporate trustee is still involved`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const individualTrustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "10",
        ceased_date_month: "5",
        ceased_date_year: "2024"
      };

      const coprorateTrustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "Yes"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [individualTrustee],
          CORPORATES: [coprorateTrustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUSTEE_ROLE);

      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("May");
      expect(resp.text).toContain("2024");

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page when corporate trustee are not still involved in the trust, individual trustee is still involved`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);

      const individualTrustee = {
        ...INDIVIUAL_TRUSTEE,
        still_involved: "Yes"
      };

      const coprorateTrustee = {
        ...CORPORATE_TRUSTEE,
        still_involved: "No",
        ceased_date_day: "10",
        ceased_date_month: "5",
        ceased_date_year: "2024"
      };
      const appData = {
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ["trusts"]: [{
          ...TRUST_WITH_ID,
          trust_name: "Flying Cats",
          INDIVIDUALS: [individualTrustee],
          CORPORATES: [coprorateTrustee]
        }]
      };
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUSTEE_ROLE);

      expect(resp.text).toContain(`${TRUSTEE_INDIVIDUAL_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).not.toContain(TRUSTEE_INDIVIDUAL_CEASED_DATE);

      expect(resp.text).toContain(`${TRUSTEE_LEGAL_ENTITY_TITLE} Flying Cats`);
      expect(resp.text).toContain(TRUSTEE_INDIVIDUAL_INVOLVED);
      expect(resp.text).toContain(TRUSTEE_LEGAL_ENTITY_CEASED_DATE);
      expect(resp.text).toContain("10");
      expect(resp.text).toContain("May");
      expect(resp.text).toContain("2024");
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${PAYMENT_LINK_JOURNEY}, with transaction and OE id`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app).post(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`redirect to ${PAYMENT_LINK_JOURNEY}, if Save and Resume not enabled`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const mockData = { ...APPLICATION_DATA_UPDATE_BO_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValue(mockData);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app).post(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`catch error on POST action for ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockCloseTransaction.mockImplementation(() => {
        throw ERROR;
      });
      const resp = await request(app).post(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
