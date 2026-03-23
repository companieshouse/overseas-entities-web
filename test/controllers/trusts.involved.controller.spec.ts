jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
jest.mock('../../src/service/overseas.entities.service');
jest.mock(".../../../src/utils/application.data");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trust/common.trust.data.mapper');
jest.mock('../../src/utils/trust/who.is.involved.mapper');
jest.mock('../../src/utils/trust/who.is.involved.mapper');
jest.mock('../../src/utils/trusts');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');

import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { Session } from '@companieshouse/node-session-handler';
import { constants } from 'http2';
import { validationResult } from 'express-validator/src/validation-result';

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import app from "../../src/app";

import request from "supertest";

import { TrusteeType } from '../../src/model/trustee.type.model';
import { ErrorMessages } from '../../src/validation/error.messages';
import { authentication } from '../../src/middleware/authentication.middleware';
import { ApplicationData } from "../../src/model";
import { isActiveFeature } from '../../src/utils/feature.flag';
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { postTrustInvolvedPage } from "../../src/utils/trust.involved";
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';

import { mapCommonTrustDataToPage } from '../../src/utils/trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from '../../src/utils/trust/who.is.involved.mapper';

import { get, post } from "../../src/controllers/trust.involved.controller";
import { TRUST_WITH_ID, OVERSEAS_ENTITY_ID } from '../__mocks__/session.mock';
import { getApplicationData, fetchApplicationData } from '../../src/utils/application.data';

import {
  TrustKey,
  TrustIndividual,
  IndividualTrustee,
} from "../../src/model/trust.model";

import {
  getRedirectUrl,
  isRemoveJourney,
  isRegistrationJourney,
  getUrlWithParamsToPath,
} from '../../src/utils/url';

import {
  getFormerTrusteesFromTrust,
  getIndividualTrusteesFromTrust,
} from '../../src/utils/trusts';

import {
  TRUSTS_URL,
  PAGE_TITLE_ERROR,
  ANY_MESSAGE_ERROR,
  TRUST_INVOLVED_TITLE,
} from '../__mocks__/text.mock';

import {
  ADD_TRUST_URL,
  TRUST_ENTRY_URL,
  UPDATE_LANDING_URL,
  TRUST_INVOLVED_URL,
  TRUST_INVOLVED_PAGE,
  RELEVANT_PERIOD_QUERY_PARAM,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  TRUST_HISTORICAL_BENEFICIAL_OWNER_URL,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE, LANDING_URL,
} from '../../src/config';

const MOCKED_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + "MOCKED_URL";

mockCsrfProtectionMiddleware.mockClear();

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockGetRedirectUrl = getRedirectUrl as jest.Mock;

const mockOverseasEntity = updateOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue(OVERSEAS_ENTITY_ID);

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

const mockIsRemoveJourney = isRemoveJourney as jest.Mock;
mockIsRemoveJourney.mockReturnValue(false);

describe('Trust Involved controller', () => {

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = `${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`;
  const mockNext = jest.fn();

  let mockReq = {} as Request;

  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;

  const mockAppData = {
    dummyAppDataKey: 'dummyApplicationDataValue',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockGetRedirectUrl.mockReset();
    mockFetchApplicationData.mockReset();
    mockGetApplicationData.mockReset();

    mockReq = {
      params: {
        trustId: trustId,
      } as Params,
      headers: {},
      session: {} as Session,
      route: '',
      method: '',
      body: {},
    } as Request;
  });

  describe('GET unit tests', () => {

    test(('success'), async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);

      const mockTrustData = {
        trustName: 'dummy',
      };
      (mapCommonTrustDataToPage as any as jest.Mock).mockReturnValue(mockTrustData);

      const mockInvolvedData = {
        involvedDummyKey: 'involvedDummyValue',
      };
      (mapTrustWhoIsInvolvedToPage as any as jest.Mock).mockReturnValue(mockInvolvedData);

      const indiviudalTrusteeData = {
        name: "indiviudalTrustee"
      };

      (getIndividualTrusteesFromTrust as any as jest.Mock).mockReturnValue(indiviudalTrusteeData);

      const formerTrusteeData = {
        name: "formerTrustee"
      };

      (getFormerTrusteesFromTrust as any as jest.Mock).mockReturnValue(formerTrusteeData);

      await get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();
      expect(mapCommonTrustDataToPage).toBeCalledTimes(1);
      expect(mapCommonTrustDataToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledTimes(1);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(getIndividualTrusteesFromTrust).toBeCalledTimes(1);
      expect(getIndividualTrusteesFromTrust).toBeCalledWith(mockAppData, trustId, false);
      expect(getFormerTrusteesFromTrust).toBeCalledTimes(1);
      expect(getFormerTrusteesFromTrust).toBeCalledWith(mockAppData, trustId, false);
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        TRUST_INVOLVED_PAGE,
        expect.objectContaining({
          pageData: expect.objectContaining({
            trustData: mockTrustData,
            ...mockInvolvedData,
            individualTrusteeData: indiviudalTrusteeData,
            formerTrusteeData: formerTrusteeData,
          }),
        }),
      );
    });

    test('catch error when post data from page', async () => {
      mockGetRedirectUrl.mockReturnValue(MOCKED_URL);
      mockReq.body = {
        id: 'dummyId',
        typeOfTrustee: 'dummyTrusteeType',
        noMoreToAdd: 'add',
      };
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetRedirectUrl.mockReturnValue(MOCKED_URL);
      mockGetApplicationData.mockReturnValue(mockAppData);
      mockFetchApplicationData.mockImplementation(() => {
        throw error;
      });

      await get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {

    test('"no more to add" button is pushed and REDIS_removal flag is set to OFF', async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetRedirectUrl.mockReturnValue(`${TRUST_ENTRY_URL}`);

      mockReq.body = {
        noMoreToAdd: 'noMoreToAdd',
      };

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL + ADD_TRUST_URL}`);
    });

    const dpPostTrustee = [
      [
        TrusteeType.HISTORICAL,
        TRUST_HISTORICAL_BENEFICIAL_OWNER_URL,
      ],
      [
        TrusteeType.INDIVIDUAL,
        TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
      ],
      [
        TrusteeType.LEGAL_ENTITY,
        TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
      ],
      [
        'unknown',
        '',
      ],
    ];

    const dpPostReviewTrustee = [
      [
        TrusteeType.HISTORICAL,
        "/" + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE,
      ],
      [
        TrusteeType.INDIVIDUAL,
        "/" + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
      ],
      [
        TrusteeType.RELEVANT_PERIOD_INDIVIDUAL_BENEFICIARY,
        "/" + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
      [
        TrusteeType.LEGAL_ENTITY,
        "/" + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
      ],
      [
        TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY,
        "/" + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
    ];

    const dpPostUpdateTrustee = [
      [
        TrusteeType.INDIVIDUAL,
        "/" + UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
      ],
      [
        TrusteeType.LEGAL_ENTITY,
        "/" + UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE,
      ],
    ];

    const dpPostRelevantPeriodUpdateTrustee = [
      [
        TrusteeType.RELEVANT_PERIOD_INDIVIDUAL_BENEFICIARY,
        "/" + UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
      [
        TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY,
        "/" + UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
    ];

    const dpPostRegisterRelevantPeriodTrustees = [
      [
        TrusteeType.RELEVANT_PERIOD_INDIVIDUAL_BENEFICIARY,
        "/" + TRUSTS_URL + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
      [
        TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY,
        "/" + TRUSTS_URL + "/" + TRUST_WITH_ID.trust_id + "/" + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
    ];

    test.each(dpPostTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockIsActiveFeature.mockReturnValue(false);
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValue(`${TRUST_ENTRY_URL}`);

        (validationResult as any as jest.Mock).mockImplementation(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        mockReq.body = {
          typeOfTrustee,
        };

        await post(mockReq, mockRes, mockNext);

        expect(mockRes.redirect).toBeCalledTimes(1);
        expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL}/${trustId}${expectedUrl}`);
      },
    );

    test.each(dpPostReviewTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValueOnce(`${UPDATE_LANDING_URL}${expectedUrl}`);

        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        const isUpdate: boolean = true;
        const isReview: boolean = true;
        await postTrustInvolvedPage(mockReq, mockRes, mockNext, isUpdate, isReview);

        expect(mockRes.redirect).toBeCalledWith(expect.stringContaining(`${UPDATE_LANDING_URL}${expectedUrl}`));
      },
    );

    test.each(dpPostUpdateTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValueOnce(`${UPDATE_LANDING_URL}${expectedUrl}`);

        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));
        const isUpdate: boolean = true;
        const isReview: boolean = false;
        await postTrustInvolvedPage(mockReq, mockRes, mockNext, isUpdate, isReview);

        expect(mockRes.redirect).toBeCalledWith(expect.stringContaining(`${UPDATE_LANDING_URL}${expectedUrl}`));
      },
    );

    test.each(dpPostRelevantPeriodUpdateTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValueOnce(`${UPDATE_LANDING_URL}${expectedUrl}`);
        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));
        const isUpdate: boolean = true;
        const isReview: boolean = false;
        await postTrustInvolvedPage(mockReq, mockRes, mockNext, isUpdate, isReview);

        expect(mockRes.redirect).toBeCalledWith(expect.stringContaining(`${UPDATE_LANDING_URL}${expectedUrl}`));
      },
    );

    test.each(dpPostRegisterRelevantPeriodTrustees)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValueOnce(`${LANDING_URL}${expectedUrl}`);

        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));
        const isUpdate: boolean = false;
        const isReview: boolean = false;
        await postTrustInvolvedPage(mockReq, mockRes, mockNext, isUpdate, isReview);

        expect(mockRes.redirect).toBeCalledWith(expect.stringContaining(`${LANDING_URL}${expectedUrl}`));
      },
    );

    test('render error', async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);
      const mockValidationErrors = [
        {
          value: undefined,
          msg: 'Select which type of individual or entity you want to add',
          param: 'typeOfTrustee',
          location: 'body',
        }, //  as ValidationError,
      ];
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockValidationErrors),
      }));

      mockReq.body = {
        dummyKey: 'dummyValue',
      };

      const mockTrustData = {
        trustName: 'dummy',
      };
      (mapCommonTrustDataToPage as any as jest.Mock).mockReturnValue(mockTrustData);

      const mockInvolvedData = {
        involvedDummyKey: 'involvedDummyValue',
      };
      (mapTrustWhoIsInvolvedToPage as any as jest.Mock).mockReturnValue(mockInvolvedData);

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled;
      expect(mapCommonTrustDataToPage).toBeCalledTimes(1);
      expect(mapCommonTrustDataToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledTimes(1);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        TRUST_INVOLVED_PAGE,
        expect.objectContaining({
          pageData: expect.objectContaining({
            trustData: mockTrustData,
            ...mockInvolvedData,
          }),
          errors: {
            errorList: [
              {
                href: '#typeOfTrustee',
                text: ErrorMessages.TRUST_INVOLVED_INVALID,
              },
            ],
            typeOfTrustee: {
              text: ErrorMessages.TRUST_INVOLVED_INVALID,
            },
          },
          formData: mockReq.body,
        }),
      );
    });

    test('catch error when post data from page', async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);
      mockReq.body = {
        id: 'dummyId',
        typeOfTrustee: 'dummyTrusteeType',
        noMoreToAdd: 'add',
      };
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST with url params unit tests', () => {

    test('"no more to add" button is pushed with url params and REDIS_removal flag is set to ON', async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);
      mockReq.body = {
        noMoreToAdd: 'noMoreToAdd',
      };

      mockIsActiveFeature.mockReturnValue(true);

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockGetRedirectUrl).toHaveBeenCalledTimes(1);
    });

    const dpPostTrustee = [
      [
        TrusteeType.HISTORICAL,
        TRUST_HISTORICAL_BENEFICIAL_OWNER_URL,
      ],
      [
        TrusteeType.INDIVIDUAL,
        TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
      ],
      [
        TrusteeType.LEGAL_ENTITY,
        TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
      ],
      [
        'unknown',
        '',
      ],
    ];

    test.each(dpPostTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockFetchApplicationData.mockReturnValue(mockAppData);
        mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        await post(mockReq, mockRes, mockNext);

        expect(mockRes.redirect).toBeCalledTimes(1);
        expect(mockRes.redirect).toBeCalledWith(`${MOCKED_URL}/${trustId}${expectedUrl}`);
      },
    );

    test('render error', async () => {
      const mockValidationErrors = [
        {
          value: undefined,
          msg: 'Select which type of individual or entity you want to add',
          param: 'typeOfTrustee',
          location: 'body',
        }, //  as ValidationError,
      ];

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockValidationErrors),
      }));

      // mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      mockReq.body = {
        dummyKey: 'dummyValue',
      };

      const mockTrustData = {
        trustName: 'dummy',
      };
      (mapCommonTrustDataToPage as any as jest.Mock).mockReturnValue(mockTrustData);

      const mockInvolvedData = {
        involvedDummyKey: 'involvedDummyValue',
      };
      (mapTrustWhoIsInvolvedToPage as any as jest.Mock).mockReturnValue(mockInvolvedData);

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled;
      expect(mapCommonTrustDataToPage).toBeCalledTimes(1);
      expect(mapCommonTrustDataToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledTimes(1);
      expect(mapTrustWhoIsInvolvedToPage).toBeCalledWith(mockAppData, trustId, false);
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        TRUST_INVOLVED_PAGE,
        expect.objectContaining({
          pageData: expect.objectContaining({
            trustData: mockTrustData,
            ...mockInvolvedData,
          }),
          errors: {
            errorList: [
              {
                href: '#typeOfTrustee',
                text: ErrorMessages.TRUST_INVOLVED_INVALID,
              },
            ],
            typeOfTrustee: {
              text: ErrorMessages.TRUST_INVOLVED_INVALID,
            },
          },
          formData: mockReq.body,
        }),
      );
    });

    test('catch error when post data from page', async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);

      mockReq.body = {
        id: 'dummyId',
        typeOfTrustee: 'dummyTrusteeType',
        noMoreToAdd: 'add',
      };
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('Endpoint Access tests with supertest', () => {

    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);

      const mockTrustData = {
        trustName: 'dummy',
      };
      (mapCommonTrustDataToPage as any as jest.Mock).mockReturnValue(mockTrustData);

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_INVOLVED_TITLE);
      expect(resp.text).toContain(mockTrustData.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test(`successfully access POST method`, async () => {
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetRedirectUrl.mockReturnValueOnce(MOCKED_URL);

      const resp = await request(app).post(pageUrl).send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.text).toContain(ADD_TRUST_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`filters out individuals without a forename or dummy associated parties`, async () => {
      mockGetRedirectUrl.mockReturnValueOnce(TRUST_ENTRY_URL);
      mockIsActiveFeature.mockReturnValue(false);

      const individualTrustee1 = { surname: "dummySurname" } as IndividualTrustee;
      const individualTrustee2 = { forename: "empty" } as IndividualTrustee;
      const mockAppData: ApplicationData = {
        [TrustKey]: [{
          'INDIVIDUALS': [ individualTrustee1, individualTrustee2 ] as TrustIndividual[],
        }]
      } as ApplicationData;

      (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);

      mockReq.body = {
        noMoreToAdd: 'noMoreToAdd',
      };

      await post(mockReq, mockRes, mockNext);
      await postTrustInvolvedPage(mockReq, mockRes, mockNext, true, true);

      expect(mockAppData.trusts?.[0].INDIVIDUALS).toEqual([individualTrustee2]);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL + ADD_TRUST_URL}`);
    });

    test(`keeps all valid individuals and ignore dummy associated parties`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetRedirectUrl.mockReturnValueOnce(TRUST_ENTRY_URL);

      const individualTrustee1 = { forename: "TestOne" } as IndividualTrustee;
      const individualTrustee2 = { forename: "TestTwo" } as IndividualTrustee;
      const individualTrustee3 = { forename: "testThree", surname: "TestSurname" } as IndividualTrustee;
      const individualTrustee4 = { surname: "OE001022A1" } as IndividualTrustee;
      const mockAppData: ApplicationData = {
        [TrustKey]: [{
          'INDIVIDUALS': [ individualTrustee1, individualTrustee2, individualTrustee3, individualTrustee4 ] as TrustIndividual[],
        }]
      } as ApplicationData;

      (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
      mockReq.body = {
        noMoreToAdd: 'noMoreToAdd',
      };

      await post(mockReq, mockRes, mockNext);
      await postTrustInvolvedPage(mockReq, mockRes, mockNext, true, true);

      expect(mockAppData.trusts?.[0].INDIVIDUALS).toEqual([individualTrustee1, individualTrustee2, individualTrustee3]);
      expect(mockAppData.trusts?.[0].INDIVIDUALS).not.toEqual([individualTrustee4]);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL + ADD_TRUST_URL}`);
    });
  });
});
