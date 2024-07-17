jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
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

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { validationResult } from 'express-validator/src/validation-result';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { TRUST_WITH_ID } from '../__mocks__/session.mock';
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR, TRUST_INVOLVED_TITLE } from '../__mocks__/text.mock';
import {
  ADD_TRUST_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  TRUST_ENTRY_URL,
  TRUST_ENTRY_WITH_PARAMS_URL,
  TRUST_HISTORICAL_BENEFICIAL_OWNER_URL,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_PAGE,
  TRUST_INVOLVED_URL,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL, 
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_LANDING_URL, 
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
} from '../../src/config';
import { get, post } from "../../src/controllers/trust.involved.controller";
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';
import { ErrorMessages } from '../../src/validation/error.messages';
import { TrusteeType } from '../../src/model/trustee.type.model';
import { getApplicationData } from '../../src/utils/application.data';
import { mapCommonTrustDataToPage } from '../../src/utils/trust/common.trust.data.mapper';
import { mapTrustWhoIsInvolvedToPage } from '../../src/utils/trust/who.is.involved.mapper';
import { getFormerTrusteesFromTrust, getIndividualTrusteesFromTrust } from '../../src/utils/trusts';
import { isActiveFeature } from '../../src/utils/feature.flag';
import { getUrlWithParamsToPath } from '../../src/utils/url';

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const MOCKED_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + "MOCKED_URL";
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

describe('Trust Involved controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = `${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`;

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  const mockAppData = {
    dummyAppDataKey: 'dummyApplicationDataValue',
  };

  beforeEach(() => {
    jest.clearAllMocks();

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
    test(('success'), () => {
      mockGetApplicationData.mockReturnValue(mockAppData);

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

      get(mockReq, mockRes, mockNext);

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

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {
    test('no more to add button pushed', async () => {
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
    
    const dpPostRelevantPeriodTrustee = [
      [
        TrusteeType.INDIVIDUAL,
        TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
      ],
      [
        TrusteeType.RELEVANT_PERIOD_LEGAL_ENTITY,
        '/' + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE + RELEVANT_PERIOD_QUERY_PARAM,
      ],
      [
        'unknown',
        '',
      ],
    ];

    test.each(dpPostTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        await post(mockReq, mockRes, mockNext);

        expect(mockRes.redirect).toBeCalledTimes(1);
        expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL}/${trustId}${expectedUrl}`);
      },
    );

    
    test.each(dpPostRelevantPeriodTrustee)(
      'success push with %p type',
      async (typeOfTrustee: string, expectedUrl: string) => {
        mockReq.body = {
          typeOfTrustee,
        };
        
        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        const isUpdate: boolean = true;
        const isReview: boolean = true;
        await postTrustInvolvedPage(mockReq, mockRes, mockNext, isUpdate, isReview);

        expect(mockRes.redirect).toBeCalledTimes(1);
        expect(mockRes.redirect).toBeCalledWith(`${UPDATE_LANDING_URL}${expectedUrl}`);
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
    test('no more to add button pushed with url params', async () => {
      mockReq.body = {
        noMoreToAdd: 'noMoreToAdd',
      };

      mockIsActiveFeature.mockReturnValueOnce(true);

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${TRUST_ENTRY_WITH_PARAMS_URL + ADD_TRUST_URL}`);
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
        mockReq.body = {
          typeOfTrustee,
        };

        (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
          isEmpty: jest.fn().mockReturnValue(true),
        }));

        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

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
      mockGetApplicationData.mockReturnValueOnce(mockAppData);

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

      const resp = await request(app).post(pageUrl).send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.text).toContain(ADD_TRUST_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });
  });
});
