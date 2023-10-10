jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');
jest.mock('../../../src/middleware/navigation/update/is.in.change.journey.middleware');
jest.mock('../../../src/utils/save.and.continue');

import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isInChangeJourney } from '../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { ApplicationData } from '../../../src/model';
import { hasBOsOrMOsUpdate } from '../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';

import { PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasBOsOrMOsUpdate = hasBOsOrMOsUpdate as jest.Mock;
mockHasBOsOrMOsUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsInChangeJourney = isInChangeJourney as jest.Mock;
mockIsInChangeJourney.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const createAppData = ({ reviewTrusts }): ApplicationData => ({
  update: {
    review_trusts: reviewTrusts,
  },
} as ApplicationData);

const get = async () => (await request(app).get(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL));
const post = async () => (await request(app).post(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL));

describe('Update - Manage Trusts - Orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReturnValue(true);
    mockGetApplicationData.mockReset();
    mockSetExtraData.mockReset();
    mockSaveAndContinue.mockReset();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when feature flag is off, 404 is returned', async (_, handler) => {
    mockIsActiveFeature.mockReturnValue(false);

    const resp = await handler();

    expect(resp.status).toEqual(404);
    expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when no trusts to review, redirects to Trusts associated with the OE page', async (_, handler) => {
    const appData: ApplicationData = createAppData({ reviewTrusts: [] });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust to review, and none in review, redirects to Review the trust page, and sets up trust for review', async (_, handler) => {
    const appData: ApplicationData = createAppData({ reviewTrusts: [{ trust_name: 'Trust 1' }] });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(false);
    expect(mockSetExtraData).toHaveBeenCalledWith(undefined, appData);
    expect(mockSaveAndContinue).toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with no trustees, redirects to manage trusts individuals and entities involved page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [],
        INDIVIDUALS: [],
        CORPORATES: [],
        review_status: {
          in_review: true,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with trustees, redirects to review former bo page if no trustees reviewed', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with trustees, redirects to review individuals page if reviewed former bos', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: true,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with trustees, redirects to review legal entities page if reviewed formerbos and individuals', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: true,
          reviewed_individuals: true,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with trustees, redirects to individuals and entities involved page if reviewed all trustees', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: true,
          reviewed_individuals: true,
          reviewed_legal_entities: true,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with no former bos and no trustees reviewed, redirects to review individuals page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with no former bos or individuals and no trustees reviewed, redirects to review legal entities page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [],
        INDIVIDUALS: [],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with former bos and no individuals and former bos reviewed, redirects to review legal entities page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_former_bos: true,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with former bos and individuals reviewed and no legal entities to review, redirects to individuals and entities involved page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [],
        review_status: {
          in_review: true,
          reviewed_former_bos: true,
          reviewed_individuals: true,
          reviewed_legal_entities: false,
        },
      }],
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await handler();

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
    expect((appData.update?.review_trusts ?? [])[0].review_status?.in_review).toBe(true);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });
});
