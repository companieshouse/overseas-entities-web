jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/utils/application.data');

import { Request, Response } from 'express';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { hasValidStatements } from '../../src/middleware/statement.validation.middleware';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getApplicationData, checkActiveBOExists, checkActiveMOExists } from "../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK,
  MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF
} from '../__mocks__/session.mock';
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from '../../src/model/beneficial.owner.statement.model';
import { BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { yesNoResponse } from '../../src/model/data.types.model';
import { RegistrableBeneficialOwnerKey, UpdateKey } from '../../src/model/update.type.model';
import { UPDATE_CHECK_YOUR_ANSWERS_URL, UPDATE_REVIEW_STATEMENT_URL } from '../../src/config';
import { ManagingOfficerKey } from '../../src/model/managing.officer.model';

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCheckActiveBOExists = checkActiveBOExists as jest.Mock;
const mockCheckActiveMOExists = checkActiveMOExists as jest.Mock;

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
          false
        ],
        [
          "when some BOs identified and 1 active BO and MO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
          true
        ]
      ])(`%s`, (_, statementValue, activeMOExists) => {
        const appData = {
          ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
          [BeneficialOwnerStatementKey]: statementValue,
          [BeneficialOwnerIndividualKey]: [UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK],
          [ManagingOfficerKey]: activeMOExists ? [MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF] : [],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes,
          }
        };
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        mockCheckActiveBOExists.mockReturnValueOnce(true);
        mockCheckActiveMOExists.mockReturnValueOnce(activeMOExists);

        hasValidStatements(req, res, next);
        expect(res.redirect).toHaveBeenCalled();
      });
    });

    describe("fails and calls next() to continue to error page", () => {
      test.each([
        [
          "when all BOs identified and 0 active BO exists",
          BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
          false,
          false,
          ["There are no active registrable beneficial owners."]
        ],
        [
          "when some BOs identified and 0 active BO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
          false,
          false,
          ["There are no active registrable beneficial owners.", "There are no active managing officers."]
        ],
        [
          "when some BOs identified, 1 active BO exists and 0 active MO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
          true,
          false,
          ["There are no active managing officers."]
        ],
        [
          "when some BOs identified, 0 active BO exists and 1 active MO exists",
          BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
          false,
          true,
          ["There are no active registrable beneficial owners."]
        ],
        [
          "when no BOs identified, 1 active BO exists and 0 active MO exists",
          BeneficialOwnersStatementType.NONE_IDENTIFIED,
          true,
          false,
          ["There is at least one active registrable beneficial owner.", "There are no active managing officers."]
        ],
        [
          "when no BOs identified, 1 active BO exists and 1 active MO exists",
          BeneficialOwnersStatementType.NONE_IDENTIFIED,
          true,
          true,
          ["There is at least one active registrable beneficial owner."]
        ],
        [
          "when all BOs identified and 1 active MO exists",
          BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
          true,
          true,
          ["There is at least one active managing officer."]
        ]
      ])(`%s`, (_, statementValue, activeBOExists, activeMOExists, expectedErrorList) => {
        const appData = {
          ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
          [BeneficialOwnerStatementKey]: statementValue,
          [BeneficialOwnerIndividualKey]: activeBOExists ? [BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF] : [],
          [ManagingOfficerKey]: activeMOExists ? [MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF] : [],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes,
          }
        };
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        mockCheckActiveBOExists.mockReturnValueOnce(activeBOExists);
        mockCheckActiveMOExists.mockReturnValueOnce(activeMOExists);

        hasValidStatements(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req['statementErrorList']).toEqual(expectedErrorList);
      });
    });
  });
});
