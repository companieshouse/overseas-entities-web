jest.mock("ioredis");
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/payment.service');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/feature.flag" );
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/trusts");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import {
  SECURE_UPDATE_FILTER_URL,
  SECURE_UPDATE_FILTER_PAGE
} from "../../../src/config";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  SERVICE_UNAVAILABLE
} from '../../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  RESUME_UPDATE_SUBMISSION_URL,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID,
  FULL_PAYMENT_REDIRECT_PATH,
  PAYMENT_HEADER
} from '../../__mocks__/session.mock';
import * as config from '../../../src/config';
import { createAndLogErrorRequest, logger } from "../../../src/utils/logger";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { getOverseasEntity } from "../../../src/service/overseas.entities.service";
import { getTransaction } from "../../../src/service/transaction.service";
import { startPaymentsSession } from "../../../src/service/payment.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../../../src/model/who.is.making.filing.model';
import { DueDiligenceKey } from '../../../src/model/due.diligence.model';
import { HasSoldLandKey, IsSecureRegisterKey, NatureOfControlType, OverseasEntityKey, Transactionkey } from '../../../src/model/data.types.model';
import { OverseasEntityDueDiligenceKey } from '../../../src/model/overseas.entity.due.diligence.model';
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from '../../__mocks__/overseas.entity.due.diligence.mock';
import { MOCK_GET_TRANSACTION_RESPONSE } from '../../__mocks__/transaction.mock';
import { mapTrustApiReturnModelToWebModel } from '../../../src/utils/trusts';
import { beneficialOwnerIndividualType, beneficialOwnerOtherType, beneficialOwnerGovType } from "../../../src/model";

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSetExtraData = setExtraData as jest.Mock;
const mockInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue("Error on resuming OE");

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue( false );

const mockGetTransactionService = getTransaction as jest.Mock;
mockGetTransactionService.mockReturnValue( {} );

const mockStartPaymentsSessionService = startPaymentsSession as jest.Mock;

const mockGetOverseasEntity = getOverseasEntity as jest.Mock;
mockGetOverseasEntity.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockMapTrustApiReturnModelToWebModel = mapTrustApiReturnModelToWebModel as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;

const baseURL = `${config.CHS_URL}${config.UPDATE_AN_OVERSEAS_ENTITY_URL}`;

const mockNocAppData = {
  ...APPLICATION_DATA_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [{
    ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
    non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]
  }, BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [{
    ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
    non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]
  }, BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [{
    ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
    non_legal_firm_members_nature_of_control_types: [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]
  }, BENEFICIAL_OWNER_GOV_OBJECT_MOCK ]
};

describe("Update Resume submission controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`Redirect to ${SECURE_UPDATE_FILTER_URL} page`, async () => {
      const mockAppData = {
        ...APPLICATION_DATA_MOCK
      };
      mockGetOverseasEntity.mockReturnValueOnce( mockAppData );

      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SECURE_UPDATE_FILTER_URL}`);
      expect(mockGetOverseasEntity).toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalled();
    });

    test(`Redirect to ${SECURE_UPDATE_FILTER_PAGE} page after Resuming the OverseasEntity with DueDiligence object`, async () => {
      const mockAppData = {
        ...APPLICATION_DATA_MOCK,
        [OverseasEntityDueDiligenceKey]: {},
        [WhoIsRegisteringKey]: "",
        [OverseasEntityKey]: "",
        [Transactionkey]: "",
        [HasSoldLandKey]: "",
        [IsSecureRegisterKey]: "",
      };
      mockIsActiveFeature.mockReturnValueOnce( true );
      mockGetOverseasEntity.mockReturnValueOnce( mockAppData );
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SECURE_UPDATE_FILTER_URL}`);
      expect(mockAppData[WhoIsRegisteringKey]).toEqual(`${WhoIsRegisteringType.AGENT}`);
      expect(mockAppData[OverseasEntityKey]).toEqual(`${OVERSEAS_ENTITY_ID}`);
      expect(mockAppData[Transactionkey]).toEqual(`${TRANSACTION_ID}`);
      expect(mockAppData[HasSoldLandKey]).toEqual('0');
      expect(mockAppData[IsSecureRegisterKey]).toEqual('0');
      expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`Redirect to ${SECURE_UPDATE_FILTER_PAGE} page after Resuming the OverseasEntity with Overseas Entity DueDiligence object`, async () => {
      const mockAppData = {
        ...APPLICATION_DATA_MOCK,
        [DueDiligenceKey]: {},
        [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
        [WhoIsRegisteringKey]: "",
        [OverseasEntityKey]: "",
        [Transactionkey]: "",
        [HasSoldLandKey]: "",
        [IsSecureRegisterKey]: "",
      };
      mockIsActiveFeature.mockReturnValueOnce( true );
      mockGetOverseasEntity.mockReturnValueOnce( mockAppData );
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SECURE_UPDATE_FILTER_URL}`);
      expect(mockAppData[WhoIsRegisteringKey]).toEqual(`${WhoIsRegisteringType.SOMEONE_ELSE}`);
      expect(mockAppData[OverseasEntityKey]).toEqual(`${OVERSEAS_ENTITY_ID}`);
      expect(mockAppData[Transactionkey]).toEqual(`${TRANSACTION_ID}`);
      expect(mockAppData[HasSoldLandKey]).toEqual('0');
      expect(mockAppData[IsSecureRegisterKey]).toEqual('0');
      expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`Redirect to starting payment page after resuming the OverseasEntity object`, async () => {
      mockIsActiveFeature.mockReturnValueOnce( true );
      mockGetOverseasEntity.mockReturnValueOnce( {
        ...APPLICATION_DATA_MOCK,
        [OverseasEntityDueDiligenceKey]: {}
      });
      mockGetTransactionService.mockReturnValueOnce( MOCK_GET_TRANSACTION_RESPONSE.resource );
      mockStartPaymentsSessionService.mockReturnValueOnce( FULL_PAYMENT_REDIRECT_PATH );

      const errorMsg = `Trans_ID: ${TRANSACTION_ID}, OE_ID: ${OVERSEAS_ENTITY_ID}. Redirect to: ${FULL_PAYMENT_REDIRECT_PATH}`;
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${FULL_PAYMENT_REDIRECT_PATH}`);
      expect(mockStartPaymentsSessionService).toHaveBeenCalledWith(
        expect.anything(),
        undefined,
        TRANSACTION_ID,
        OVERSEAS_ENTITY_ID,
        { headers: PAYMENT_HEADER },
        baseURL
      );
      expect(mockInfoRequest).toHaveBeenCalledWith( expect.anything(), `Payments Session created on Resume link with, ${errorMsg}`);
      expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`Redirect to starting payment page after resuming the OverseasEntity object and trusts feature flag on`, async () => {
      mockIsActiveFeature.mockReturnValueOnce( true );
      mockIsActiveFeature.mockReturnValueOnce( true ); // needs twice both save and resume AND trusts
      mockGetOverseasEntity.mockReturnValueOnce( {
        ...APPLICATION_DATA_MOCK,
        [OverseasEntityDueDiligenceKey]: {}
      });
      mockGetTransactionService.mockReturnValueOnce( MOCK_GET_TRANSACTION_RESPONSE.resource );
      mockStartPaymentsSessionService.mockReturnValueOnce( FULL_PAYMENT_REDIRECT_PATH );

      const errorMsg = `Trans_ID: ${TRANSACTION_ID}, OE_ID: ${OVERSEAS_ENTITY_ID}. Redirect to: ${FULL_PAYMENT_REDIRECT_PATH}`;
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${FULL_PAYMENT_REDIRECT_PATH}`);
      expect(mockStartPaymentsSessionService).toHaveBeenCalledWith(
        expect.anything(),
        undefined,
        TRANSACTION_ID,
        OVERSEAS_ENTITY_ID,
        { headers: PAYMENT_HEADER },
        baseURL
      );
      expect(mockInfoRequest).toHaveBeenCalledWith( expect.anything(), `Payments Session created on Resume link with, ${errorMsg}`);
      expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockMapTrustApiReturnModelToWebModel).toHaveBeenCalledTimes(1);
    });

    test(`Should throw an error on Resuming the OverseasEntity`, async () => {
      mockIsActiveFeature.mockReturnValueOnce( true );
      mockGetOverseasEntity.mockImplementationOnce( null as any );

      const errorMsg = `Error on resuming OE - Transaction ID: ${TRANSACTION_ID}, OverseasEntity ID: ${OVERSEAS_ENTITY_ID}`;
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledWith( expect.anything(), errorMsg);

      expect(mockSetExtraData).not.toHaveBeenCalled();
    });

    test("Catch error when resuming Overseas Entity", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOverseasEntity.mockReturnValueOnce(() => {throw Error(ANY_MESSAGE_ERROR);});
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`Do not remove old NOCs after resuming the OverseasEntity Update submission and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce( true ); // REDIS flag
      mockIsActiveFeature.mockReturnValueOnce( true ); // trusts feature flag
      mockIsActiveFeature.mockReturnValueOnce( true ); // new NOCs

      const mockAppData = { ...mockNocAppData };
      mockGetOverseasEntity.mockReturnValueOnce( mockAppData );
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(mockAppData.beneficial_owners_individual?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_individual?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]);
      expect(mockAppData.beneficial_owners_government_or_public_authority?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_government_or_public_authority?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockNocAppData.beneficial_owners_corporate?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_corporate?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
    });

    test(`Do not remove old NOCs after resuming the OverseasEntity Update submission and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce( true ); // REDIS flag
      mockIsActiveFeature.mockReturnValueOnce( true ); // trusts feature flag
      mockIsActiveFeature.mockReturnValueOnce( false ); // new NOCs

      const mockAppData = { ...mockNocAppData };
      mockGetOverseasEntity.mockReturnValueOnce( mockAppData );
      const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

      expect(resp.status).toEqual(302);
      expect(mockAppData.beneficial_owners_individual?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_individual?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]);
      expect(mockAppData.beneficial_owners_government_or_public_authority?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_government_or_public_authority?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockNocAppData.beneficial_owners_corporate?.[0].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS, NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(mockAppData.beneficial_owners_corporate?.[1].non_legal_firm_members_nature_of_control_types).toEqual(
        [NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
    });
  });
});
