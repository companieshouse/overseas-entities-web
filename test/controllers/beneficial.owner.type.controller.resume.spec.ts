jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/feature.flag" );

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import * as config from "../../src/config";
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK } from '../__mocks__/session.mock';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { EntityNumberKey } from '../../src/model/data.types.model';
import { TrustKey } from '../../src/model/trust.model';

mockCsrfProtectionMiddleware.mockClear();
mockJourneyDetectionMiddleware.mockClear();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller on resume", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe("POST Submit", () => {
    test(`redirects to the trust interrupt page with entity_number null on resume`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true);
      const appDataMock = {
        ...APPLICATION_DATA_MOCK,
        [EntityNumberKey]: null,
        [TrustKey]: undefined,
        [BeneficialOwnerIndividualKey]: [
          {
            trustees_nature_of_control_types: [ "some trusts noc type" ]
          },
        ],
      };
      mockGetApplicationData.mockReturnValueOnce(appDataMock);
      mockGetApplicationData.mockReturnValueOnce(appDataMock);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      const next_page = "/register-an-overseas-entity/trusts/trust-interrupt";
      expect(mockGetApplicationData).toHaveBeenCalled();
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(next_page);
      expect(resp.header.location).toEqual(next_page);
    });
  });
});
