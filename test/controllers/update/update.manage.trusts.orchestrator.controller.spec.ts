jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');
jest.mock('../../../src/middleware/navigation/update/is.in.change.journey.middleware');
jest.mock('../../../src/utils/save.and.continue');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  SECURE_UPDATE_FILTER_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
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
import { ANY_MESSAGE_ERROR, PAGE_NOT_FOUND_TEXT, SERVICE_UNAVAILABLE } from '../../__mocks__/text.mock';
import { Trust } from '../../../src/model/trust.model';
import { UpdateKey } from '../../../src/model/update.type.model';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';

mockCsrfProtectionMiddleware.mockClear();
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

const createChangeAppData = ({ reviewTrusts, trusts }): ApplicationData => ({
  trusts: trusts,
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
    expect((appData.update?.review_trusts ?? [])[0].review_status).toEqual({
      in_review: true,
      reviewed_trust_details: false,
      reviewed_former_bos: false,
      reviewed_individuals: false,
      reviewed_legal_entities: false,
    });
    expect(mockSetExtraData).toHaveBeenCalledWith(undefined, appData);
    expect(mockSaveAndContinue).toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with no trustees, and has reviewed trust details, redirects to manage trusts individuals and entities involved page', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [],
        INDIVIDUALS: [],
        CORPORATES: [],
        review_status: {
          in_review: true,
          reviewed_trust_details: true,
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
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test.each([
    ['GET', get],
    ['POST', post],
  ])('%s - when a trust is in review, with trustees, and has reviewed trust details, redirects to review former bo page if no trustees reviewed', async (_, handler) => {
    const appData: ApplicationData = createAppData({
      reviewTrusts: [{
        HISTORICAL_BO: [{}],
        INDIVIDUALS: [{}],
        CORPORATES: [{}],
        review_status: {
          in_review: true,
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
          reviewed_trust_details: true,
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
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });
});

describe('Update - Mange Trusts - Orchestrator - Change Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReturnValue(true);
  });

  test('passing TrustId puts trust back into review and redirects to the update-manage-trusts-review-the-trust page', async () => {
    const trustId = '1';
    mockGetApplicationData.mockReturnValue({
      trusts: [{ trust_id: trustId, trust_name: 'trust name' } as Trust],
      [UpdateKey]: {
        review_trusts: []
      }
    });

    const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL + '/' + trustId);
    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
    expect(mockSetExtraData).toHaveBeenCalled();
    expect(mockSaveAndContinue).toHaveBeenCalled();
  });

  test('passing invalid TrustId redirects user to the secure-update-filter page', async () => {
    mockGetApplicationData.mockReturnValue({});

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/1234`);
    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(SECURE_UPDATE_FILTER_URL);
    expect(mockSetExtraData).not.toHaveBeenCalled();
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  test("catch error", async () => {
    mockGetApplicationData.mockReturnValue({
      trusts: [{ trust_id: '1', trust_name: 'trust name' } as Trust],
      [UpdateKey]: {
        review_trusts: []
      }
    });

    mockSetExtraData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/1`);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
  test.each([
    [TrusteeType.HISTORICAL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL],
    [TrusteeType.INDIVIDUAL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [TrusteeType.LEGAL_ENTITY, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL]
  ])('%s - when the trusteeChangeHandler is hit the correct page is reached', async (trusteeType, destinationPage) => {
    const appData: ApplicationData = createChangeAppData({
      reviewTrusts: [],
      trusts: [
        {
          trust_id: "1",
          trust_name: "test",
          unable_to_obtain_all_trust_info: "test",
          creation_date_day: "20",
          creation_date_month: "12",
          creation_date_year: "1999",
          ch_reference: "test",
          CORPORATES: [
            {
              identification_legal_authority: "test",
              id: "1",
              identification_legal_form: "test",
              is_on_register_in_country_formed_in: yesNoResponse.Yes,
              is_service_address_same_as_principal_address: yesNoResponse.Yes,
              identification_country_registration: "test",
              identification_place_registered: "test",
              identification_registration_number: "test",
              ro_address_country: "test",
              ro_address_line_1: "test",
              ro_address_locality: "test",
              ro_address_postal_code: "test",
              ro_address_premises: "test",
              ro_address_region: "test",
              type: "test",
              name: "corporate test"
            }
          ],
          HISTORICAL_BO: [
            {
              id: "1",
              corporate_name: "history",
              ceased_date_day: "20",
              ceased_date_month: "12",
              ceased_date_year: "2020",
              surname: "test",
              forename: "test",
              notified_date_day: "20",
              notified_date_month: "12",
              notified_date_year: "1999",
              corporate_indicator: yesNoResponse.Yes
            }
          ],
          INDIVIDUALS: [
            {
              id: "1",
              forename: "test",
              surname: "individual",
              type: RoleWithinTrustType.BENEFICIARY,
              other_forenames: "",
              dob_day: "20",
              dob_month: "12",
              dob_year: "1999",
              nationality: "test",
              ura_address_country: "test",
              ura_address_line_1: "test",
              ura_address_locality: "test",
              ura_address_postal_code: "test",
              ura_address_premises: "test"
            }
          ]
        },
      ]
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/1/${trusteeType}/1`);

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(`${destinationPage}/1`);
    expect(mockSetExtraData).toHaveBeenCalled();
    expect(mockSaveAndContinue).toHaveBeenCalled();
  });

  test('%s - when the trusteeChangeHandler is hit with empty trusteeType the secure update filter page is reached', async () => {
    const appData: ApplicationData = createChangeAppData({
      reviewTrusts: [],
      trusts: [
        {
          trust_id: "1",
          trust_name: "test",
          unable_to_obtain_all_trust_info: "test",
          creation_date_day: "20",
          creation_date_month: "12",
          creation_date_year: "1999",
          ch_reference: "test"
        }
      ]
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/1//1`);

    expect(resp.status).toBe(404);
    expect(resp.header.location).toEqual(undefined);
  });

  test('when the trusteeChangeHandler is hit with undefined trusteeType the secure update filter page is reached', async () => {
    const appData: ApplicationData = createChangeAppData({
      reviewTrusts: [],
      trusts: [
        {
          trust_id: "1",
          trust_name: "test",
          unable_to_obtain_all_trust_info: "test",
          creation_date_day: "20",
          creation_date_month: "12",
          creation_date_year: "1999",
          ch_reference: "test"
        }
      ]
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/1/${undefined}/1`);

    expect(resp.status).toBe(500);
    expect(resp.header.location).toEqual(undefined);
  });

  test.each([
    ["valid", "review the trust", 1, UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL],
    ["invalid", "secure update filter", 2, SECURE_UPDATE_FILTER_URL]
  ])('when the trusteeChangeHandler is hit with a %s trust change the %s page is reached', async (_, __, trustId, destinationPage) => {
    const appData: ApplicationData = createChangeAppData({
      reviewTrusts: [],
      trusts: [
        {
          trust_id: "1",
          trust_name: "test",
          unable_to_obtain_all_trust_info: "test",
          creation_date_day: "20",
          creation_date_month: "12",
          creation_date_year: "1999",
          ch_reference: "test"
        }
      ]
    });
    mockGetApplicationData.mockReturnValue(appData);

    const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL}/${trustId}`);

    expect(resp.status).toBe(302);
    expect(resp.header.location).toEqual(destinationPage);

  });
});
