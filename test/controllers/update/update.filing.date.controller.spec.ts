jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock("../../../src/utils/feature.flag" );
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');

import * as config from "../../../src/config";
import app from "../../../src/app";
import request from "supertest";
import { beforeEach, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { createOverseasEntity, updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { postTransaction } from "../../../src/service/transaction.service";
import { getApplicationData } from "../../../src/utils/application.data";
import { EntityNumberKey, OverseasEntityKey, Transactionkey } from '../../../src/model/data.types.model';
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";

import {
  APPLICATION_DATA_MOCK,
  OVERSEAS_ENTITY_ID,
  COMPANY_NAME,
  TRANSACTION_ID
} from '../../__mocks__/session.mock';

import {
  ANY_MESSAGE_ERROR,
  BACK_LINK_FOR_UPDATE_FILING_DATE,
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { NextFunction } from "express";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;
mockCreateOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

describe("Update Filing Date controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.UPDATE_FILING_DATE_PAGE} page`, async () => {
      const resp = await request(app).get(config.UPDATE_FILING_DATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Date (NOT LIVE)");
      expect(resp.text).toContain(BACK_LINK_FOR_UPDATE_FILING_DATE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_FILING_DATE_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.OVERSEAS_ENTITY_PRESENTER_URL} page after a successful post from ${config.UPDATE_FILING_DATE_PAGE}`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({ [EntityNumberKey]: COMPANY_NAME });

      expect(resp.status).toEqual(302);
    });

    test(`redirect to the ${config.OVERSEAS_ENTITY_PRESENTER_URL} page with transaction and overseas entity already created`, async () => {
      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({ [EntityNumberKey]: COMPANY_NAME });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockTransactionService).not.toHaveBeenCalled();
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${config.OVERSEAS_ENTITY_PRESENTER_URL}`);
    });

    test(`redirect to the ${config.OVERSEAS_ENTITY_PRESENTER_URL} page after a successful creation of transaction and overseas entity`, async () => {
      const mockData = { ...APPLICATION_DATA_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({ [EntityNumberKey]: COMPANY_NAME });

      expect(resp.status).toEqual(302);
      expect(mockData[Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockData[OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${config.OVERSEAS_ENTITY_PRESENTER_URL}`);
    });

    test(`catch error on POST action for ${config.UPDATE_FILING_DATE_URL} page`, async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({});
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
