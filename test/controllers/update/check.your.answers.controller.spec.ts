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
  CHANGE_LINK_ENTITY_INCORPORATION_COUNTRY,
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
  UPDATE_TRUSTS_ASSOCIATED_BACK_LINK,
  HOME_ADDRESS_LINE1,
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
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF
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

import { OverseasEntityKey, Transactionkey } from '../../../src/model/data.types.model';
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

describe("CHECK YOUR ANSWERS controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockValidateStatements.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
    mockSummaryPagesGuard.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with contact details section`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_BACK_LINK);
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} with statement validation on and trusts flag on with trust details section`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} with statement validation off and trusts flag on with trust details section`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(false);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_TRUSTS_ASSOCIATED_BACK_LINK);
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with contact details section with (ceased) existing BO`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_CH_REF_UPDATE_MOCK);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_BACK_LINK);
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_BACK_LINK);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_BENEFICIAL_OWNER_STATEMENTS_CEASED_TITLE);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_NAME);
      expect(resp.text).not.toContain(CHANGE_LINK_ENTITY_INCORPORATION_COUNTRY);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_SERVICE_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_EMAIL);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_LEGAL_FORM);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_GOVERNING_LAW);
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with verification checks - Agent selected`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
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
    });

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with verification checks - OE (Someone else) selected`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with private BO data displayed`, async () => {
      const updatedMockDataForBo = {
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK, [BeneficialOwnerIndividualKey]:
          [
            {
              ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
              usual_residential_address: { ...ADDRESS, line_1: "Private BO addressLine1" }
            },

          ], [BeneficialOwnerGovKey]:
          [
            {
              ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
              principal_address: { ...ADDRESS, line_1: "Private BO Gov Line1" }
            }
          ], [BeneficialOwnerOtherKey]:
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

    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page with private MO data displayed`, async () => {
      const updatedMockDataForMo = {
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK, [managingOfficerType.ManagingOfficerKey]:
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
