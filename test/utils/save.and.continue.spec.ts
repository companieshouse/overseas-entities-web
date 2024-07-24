jest.mock("../../src/service/overseas.entities.service" );

import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { Request } from "express";
import { Session } from '@companieshouse/node-session-handler';

import { saveAndContinue } from '../../src/utils/save.and.continue';
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { getSessionRequestWithExtraData } from '../__mocks__/session.mock';

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const session = getSessionRequestWithExtraData();
const req = { session } as Request;

describe('saveAndContinue test suite', () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('should call updateOverseasEntity if feature flag is true', async () => {
    await saveAndContinue(req, req.session as Session);
    expect(mockUpdateOverseasEntity).toBeCalledWith(req, req.session);
  });

});
