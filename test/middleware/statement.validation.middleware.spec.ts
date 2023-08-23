jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/utils/application.data');

import { Request, Response } from 'express';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { hasValidStatements } from '../../src/middleware/statement.validation.middleware';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getApplicationData, checkActiveBOExists, hasNotAddedOrCeasedBos } from "../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK, UPDATE_OBJECT_MOCK
} from '../__mocks__/session.mock';
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from '../../src/model/beneficial.owner.statement.model';
import { BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { yesNoResponse } from '../../src/model/data.types.model';
import { RegistrableBeneficialOwnerKey, UpdateKey } from '../../src/model/update.type.model';
import { UPDATE_CHECK_YOUR_ANSWERS_URL, UPDATE_REVIEW_STATEMENT_URL } from '../../src/config';

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCheckActiveBOExists = checkActiveBOExists as jest.Mock;
const mockHasNotAddedOrCeasedBOs = hasNotAddedOrCeasedBos as jest.Mock;

describe("hasValidStatements", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("when feature flag is off and on change journey redirects to update-beneficial-owner-bo-mo-review", () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [UpdateKey]: {
        ...UPDATE_OBJECT_MOCK,
        no_change: false
      }
    });

    hasValidStatements(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith(UPDATE_CHECK_YOUR_ANSWERS_URL);
  });

  test("when feature flag is off and on no change journey redirects to review-update-statement", () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [UpdateKey]: {
        ...UPDATE_OBJECT_MOCK,
        no_change: true
      }
    });

    hasValidStatements(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith(UPDATE_REVIEW_STATEMENT_URL);
  });

  describe("validateIdentifiedBOsStatement", () => {
    describe("passes and redirects to next page", () => {
      test.each([
        [
          "when all BOs identified and 1 active BO exists",
          BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        ],
        [
          "when some BOs identified and 1 active BO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        ],
      ])(`%s`, (_, statementValue) => {
        const appData = {
          ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
          [BeneficialOwnerStatementKey]: statementValue,
          [BeneficialOwnerIndividualKey]: [UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes,
          }
        };
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        mockCheckActiveBOExists.mockReturnValueOnce(true);
        mockHasNotAddedOrCeasedBOs.mockReturnValueOnce(false);

        hasValidStatements(req, res, next);
        expect(res.redirect).toHaveBeenCalled();
      });
    });

    describe("fails and calls next() to continue to error page", () => {
      test.each([
        [
          "when all BOs identified and no active BO exists",
          BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        ],
        [
          "when some BOs identified and no active BO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        ],
        [
          "when no BOs identified and 1 active BO exists",
          BeneficialOwnersStatementType.NONE_IDENTIFIED,
        ]
      ])(`%s`, (_, statementValue) => {
        const appData = {
          ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
          [BeneficialOwnerStatementKey]: statementValue,
          [BeneficialOwnerIndividualKey]: [BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes,
          }
        };
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        if (appData[BeneficialOwnerStatementKey] === BeneficialOwnersStatementType.NONE_IDENTIFIED) {
          mockCheckActiveBOExists.mockReturnValueOnce(true);
        } else {
          mockCheckActiveBOExists.mockReturnValueOnce(false);
        }
        mockHasNotAddedOrCeasedBOs.mockReturnValueOnce(false);

        hasValidStatements(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  });
});
