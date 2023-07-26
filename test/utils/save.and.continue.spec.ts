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

  test('should call updateOverseasEntity if is registration not update journey', async () => {
    await saveAndContinue(req, req.session as Session, true);
    expect(mockUpdateOverseasEntity).toBeCalledWith(req, req.session);
  });

  test('should not call updateOverseasEntity if not registration and feature flag is false', async () => {
    mockIsActiveFeature.mockReturnValue(false);
    await saveAndContinue(req, req.session as Session, false);
    expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
  });

  test('should call updateOverseasEntity if not registration and feature flag is true', async () => {
    mockIsActiveFeature.mockReturnValue(true);
    await saveAndContinue(req, req.session as Session, false);
    expect(mockUpdateOverseasEntity).toHaveBeenCalled();
  });
});
