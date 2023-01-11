jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/is.secure.register.middleware');
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/utils/trust/details.mapper');
jest.mock('../../src/utils/trusts');

import { Params } from 'express-serve-static-core';
import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from "../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from '../__mocks__/session.mock';
import app from "../../src/app";
import { TRUST_DETAILS_PAGE, TRUST_DETAILS_URL, TRUST_INVOLVED_URL } from '../../src/config';
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasBOsOrMOs } from '../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware';
import { get, post, TRUST_DETAILS_TEXTS } from '../../src/controllers/trust.details.controller';
import { getApplicationData, setExtraData } from '../../src/utils/application.data';
import {
  generateTrustId,
  mapBeneficialOwnerToSession,
  mapBoIndividualToPage,
  mapBoOtherToPage,
  mapDetailToPage,
  mapDetailToSession,
} from '../../src/utils/trust/details.mapper';
import { getBoIndividualAssignableToTrust, getBoOtherAssignableToTrust } from '../../src/utils/trusts';
import { Trust } from '../../src/model/trust.model';
import { BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../src/model/beneficial.owner.other.model';

describe('Trust Details controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;
  mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

  const mockSetExtraData = setExtraData as jest.Mock;

  const pageUrl = TRUST_DETAILS_URL;

  const mockTrust1Data = {
    trust_id: '999',
    trust_name: 'dummyTrustName1',
  } as Trust;

  const mockTrust2Data = {
    trust_id: '802',
    trust_name: 'dummyTrustName2',
  } as Trust;

  const mockTrust3Data = {
    trust_id: '803',
    trust_name: 'dummyTrustName3',
  } as Trust;

  let mockAppData = {};

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockAppData = {
      trusts: [
        mockTrust1Data,
        mockTrust2Data,
        mockTrust3Data,
      ],
    };

    mockReq = {
      params: {
        trustId: mockTrust2Data.trust_id,
      } as Params,
      session: {} as Session,
      route: '',
      method: '',
    } as Request;
  });

  describe('GET tests', () => {
    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('render trust data based on parameter id', () => {
      mockGetApplicationData.mockReturnValue(mockAppData);

      const expectMapResult = { dummyKey: 'EXPECT-MAP-RESULT' };
      (mapDetailToPage as jest.Mock).mockReturnValueOnce(expectMapResult);

      const expectBoIndividualItems = { dummyKey: 'EXPECT-BENEFICIAL-OWNERS-INDIVID-LIST' };
      const expectBoOtherItems = { dummyKey: 'EXPECT-BENEFICIAL-OWNERS-OTHER-LIST' };
      (getBoIndividualAssignableToTrust as jest.Mock).mockReturnValueOnce([expectBoIndividualItems]);
      (getBoOtherAssignableToTrust as jest.Mock).mockReturnValueOnce([expectBoIndividualItems]);
      (mapBoIndividualToPage as jest.Mock).mockReturnValueOnce(expectBoIndividualItems);
      (mapBoOtherToPage as jest.Mock).mockReturnValueOnce(expectBoOtherItems);

      get(mockReq, mockRes, mockNext);

      expect(mapDetailToPage).toBeCalledTimes(1);
      expect(mapDetailToPage).toBeCalledWith(mockAppData, mockTrust2Data.trust_id);

      expect(getBoIndividualAssignableToTrust).toBeCalledTimes(1);
      expect(getBoOtherAssignableToTrust).toBeCalledTimes(1);

      expect(mockRes.render).toBeCalledWith(
        TRUST_DETAILS_PAGE,
        expect.objectContaining({
          formData: expectMapResult,
          pageData: {
            beneficialOwners: [
              expectBoIndividualItems,
              expectBoOtherItems,
            ],
          },
        }),
      );
    });
  });

  describe('POST tests', () => {
    beforeEach(() => {
      mockReq.body = {
        id: 'dummyId',
        name: 'dummyName',
        createdDay: '77',
        createdMonth: '88',
        createdYears: '9999',
        beneficialOwnersIds: ['bo1id', 'bo2id'],
      };
    });

    test('catch error when post data from page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('add new trust in session', () => {
      const expectBoIndividuals = ['individuals bo-s'];
      const expectBoOther = ['ole bo-s'];
      mockAppData = {
        ...mockAppData,
        [BeneficialOwnerIndividualKey]: expectBoIndividuals,
        [BeneficialOwnerOtherKey]: expectBoOther,
      };

      mockGetApplicationData.mockReturnValueOnce(mockAppData);

      const expectTrustResult = {
        dummyMapKey: 'MAP-TO-SESSION-RESULT',
      };
      (mapDetailToSession as jest.Mock).mockImplementation(() => expectTrustResult);

      const expectNewTrustId = 'dummyId';
      (generateTrustId as jest.Mock).mockReturnValue(expectNewTrustId);

      const expectBo = ['dummyBo'];
      (mapBeneficialOwnerToSession as jest.Mock).mockReturnValue(expectBo);

      post(mockReq, mockRes, mockNext);

      expect((generateTrustId as jest.Mock)).toBeCalledTimes(1);

      expect(mapBeneficialOwnerToSession).toBeCalledTimes(2);
      expect(mapBeneficialOwnerToSession).toHaveBeenNthCalledWith(
        1,
        expectBoIndividuals,
        mockReq.body.beneficialOwnersIds,
        expectNewTrustId,
      );
      expect(mapBeneficialOwnerToSession).toHaveBeenNthCalledWith(
        2,
        expectBoOther,
        mockReq.body.beneficialOwnersIds,
        expectNewTrustId,
      );

      expect(mockSetExtraData).toBeCalledWith(
        mockReq.session,
        expect.objectContaining({
          ...mockAppData,
          trusts: expect.arrayContaining([
            mockTrust1Data,
            mockTrust2Data,
            mockTrust3Data,
            {
              ...expectTrustResult,
              trust_id: expectNewTrustId,
            },
          ]),
          [BeneficialOwnerOtherKey]: expectBo,
          [BeneficialOwnerIndividualKey]: expectBo,
        }),
      );

      expect(mockNext).not.toBeCalled();
    });

    test('update trust in session', () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);

      const expectTrustResult = {
        trust_id: mockTrust2Data.trust_id,
        dummyMapKey: 'MAP-TO-SESSION-RESULT',
      };
      (mapDetailToSession as jest.Mock).mockImplementation(() => expectTrustResult);

      (mapBeneficialOwnerToSession as jest.Mock).mockReturnValue([]);

      post(mockReq, mockRes, mockNext);

      expect((generateTrustId as jest.Mock)).not.toBeCalled();

      expect(mapBeneficialOwnerToSession).toBeCalledTimes(2);

      expect(mockSetExtraData).toBeCalledWith(
        mockReq.session,
        expect.objectContaining({
          ...mockAppData,
          trusts: expect.arrayContaining([
            mockTrust1Data,
            mockTrust3Data,
            {
              ...mockTrust2Data,
              ...expectTrustResult,
            },
          ]),
          [BeneficialOwnerOtherKey]: [],
          [BeneficialOwnerIndividualKey]: [],
        }),
      );

      expect(mockNext).not.toBeCalled();
    });
  });

  describe('Endpoint Access tests', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasBOsOrMOs as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());

      (getBoIndividualAssignableToTrust as jest.Mock).mockReturnValueOnce([]);
      (getBoOtherAssignableToTrust as jest.Mock).mockReturnValueOnce([]);
    });

    test(`successfully access GET method`, async () => {
      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_DETAILS_TEXTS.title);
      expect(resp.text).toContain(TRUST_DETAILS_TEXTS.subtitle);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('successfully access POST method', async () => {
      mockGetApplicationData.mockReturnValue({});

      (mapDetailToSession as jest.Mock).mockReturnValue({
        trust_id: mockTrust2Data.trust_id,
      });

      const resp = await request(app)
        .post(pageUrl)
        .send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${mockTrust2Data.trust_id}`);
    });
  });
});
