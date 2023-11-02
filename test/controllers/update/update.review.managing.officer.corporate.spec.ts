jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/save.and.continue');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import request from "supertest";
import app from "../../../src/app";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, prepareData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_CH_REF_UPDATE_MOCK, REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE } from "../../__mocks__/session.mock";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_CONTACT_NAME, UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_HEADING } from '../../__mocks__/text.mock';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL } from '../../../src/config';

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
mockPrepareData.mockImplementation((data: any, keys: string[]) =>
  keys.reduce((o, key) => Object.assign(o, { [key]: data[key] }), {})
);

describe('Review managing officer corporate controller tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test(`renders the review-managing-officer-corporate page for MO already popped from appData.update`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK
      });
      const resp = await request(app).get(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + "?index=0");
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_HEADING);
      expect(resp.text).toContain(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_CONTACT_NAME);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + "?index=0");

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe(`POST tests`, () => {
    test(`redirect to update-beneficial-owner-type page on successful submission`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK
      });
      const resp = await request(app)
        .post(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + "?index=0")
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/update-an-overseas-entity/update-beneficial-owner-type");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`throw validation error on update-beneficial-owner-type without complete data`, async () => {
      const formData = REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE;
      formData['is_still_mo'] = '';
      const resp = await request(app)
        .post(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + "?index=0")
        .send(formData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_HEADING);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + "?index=0")
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
