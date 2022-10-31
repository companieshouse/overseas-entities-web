jest.mock("../../src/utils/feature.flag" );
jest.mock("../../src/service/overseas.entities.service" );

import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { Request } from "express";
import { Session } from '@companieshouse/node-session-handler';

import { saveAndContinue } from '../../src/utils/save.and.continue';
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getSessionRequestWithExtraData } from '../__mocks__/session.mock';

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const session = getSessionRequestWithExtraData();
const req = { session } as Request;

describe('saveAndContinue test suite', () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('should call updateOverseasEntity if feature flag is true', () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    saveAndContinue(req, req.session as Session);
    expect(mockUpdateOverseasEntity).toBeCalledWith(req, req.session);
  });

  test('should not call updateOverseasEntity if feature flag is false', () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    saveAndContinue(req, req.session as Session);
    expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
  });

});
