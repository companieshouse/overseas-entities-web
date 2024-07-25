jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/url");

import { Request, Response } from 'express';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { validateStatements, statementValidationErrorsGuard } from '../../src/middleware/statement.validation.middleware';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getApplicationData, checkActiveBOExists, checkActiveMOExists, hasAddedOrCeasedBO } from "../../src/utils/application.data";

import {
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
  MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK
} from '../__mocks__/session.mock';
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from '../../src/model/beneficial.owner.statement.model';
import { BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { yesNoResponse } from '../../src/model/data.types.model';
import { RegistrableBeneficialOwnerKey, UpdateKey } from '../../src/model/update.type.model';
import { REMOVE_CONFIRM_STATEMENT_URL } from '../../src/config';
import { ManagingOfficerKey } from '../../src/model/managing.officer.model';
import { isRemoveJourney } from "../../src/utils/url";

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCheckActiveBOExists = checkActiveBOExists as jest.Mock;
const mockCheckActiveMOExists = checkActiveMOExists as jest.Mock;
const mockHasAddedOrCeasedBO = hasAddedOrCeasedBO as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;

describe('statement validation middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("statementValidationErrorsGuard", () => {
    test(`Redirects to ${REMOVE_CONFIRM_STATEMENT_URL} when on the remove journey`, () => {
      mockIsRemoveJourney.mockReturnValueOnce(true);
      statementValidationErrorsGuard(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(REMOVE_CONFIRM_STATEMENT_URL);
    });
  });

  describe("validateStatements", () => {
    describe("validation passes, no errors added to request, moves onto next middleware", () => {
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
          [ManagingOfficerKey]: [MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: yesNoResponse.Yes,
          }
        };
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        mockCheckActiveBOExists.mockReturnValueOnce(true);
        mockHasAddedOrCeasedBO.mockReturnValueOnce(true);
        mockCheckActiveMOExists.mockReturnValueOnce(activeMOExists);

        validateStatements(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req['statementErrorList']).toEqual([]);
      });
    });

    test.each([
      [
        "when reason to believe someone has become or ceased to be a BO, with a new BO",
        true,
        yesNoResponse.Yes,
        undefined,
        undefined,
      ],
      [
        "when reason to believe someone has become or ceased to be a BO, with a ceased BO",
        true,
        yesNoResponse.Yes,
        'test-ch-reference',
        { day: '1', month: '3', year: '2023' },
      ],
    ])(`%s`, (_, addedOrCeased, response, ch_reference, ceased_date) => {
      const BOI_MOCK = {
        ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        ceased_date,
        ch_reference,
      };

      const appData = {
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [BOI_MOCK],
        [UpdateKey]: {
          ...UPDATE_OBJECT_MOCK,
          [RegistrableBeneficialOwnerKey]: response,
        }
      };

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockCheckActiveBOExists.mockReturnValueOnce(true);
      mockHasAddedOrCeasedBO.mockReturnValueOnce(addedOrCeased);

      validateStatements(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req['statementErrorList']).toEqual([]);
    });

    describe("validation fails on initial statement, adds errors to request, moves onto next middleware", () => {
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
        mockHasAddedOrCeasedBO.mockReturnValueOnce(true);

        validateStatements(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req['statementErrorList']).toEqual(expectedErrorList);
      });
    });

    describe("validation fails on second statement, adds errors to request, moves onto next middleware", () => {
      test.each([
        [
          "when reason to believe someone has become or ceased to be a BO, with no new BO and no ceased BO",
          yesNoResponse.Yes,
          false,
          'test-ch-reference',
          undefined,
          ['You have not added or ceased a beneficial owner as part of this update statement.'],
        ],
        [
          "when no reason to believe someone has become or ceased to be a BO, with a new BO",
          yesNoResponse.No,
          true,
          undefined,
          undefined,
          ['You have added or ceased a beneficial owner as part of this update statement.'],
        ],
        [
          "when no reason to believe someone has become or ceased to be a BO, with a ceased BO",
          yesNoResponse.No,
          true,
          'test-ch-reference',
          { day: '1', month: '3', year: '2023' },
          ['You have added or ceased a beneficial owner as part of this update statement.'],
        ],
      ])(`%s`, (_, response, hasAddedOrCeased, ch_reference, ceased_date, expectedErrorList) => {
        const BOI_MOCK = {
          ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
          ceased_date,
          ch_reference,
        };

        const appData = {
          [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
          [BeneficialOwnerIndividualKey]: [BOI_MOCK],
          [UpdateKey]: {
            ...UPDATE_OBJECT_MOCK,
            [RegistrableBeneficialOwnerKey]: response,
          }
        };

        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetApplicationData.mockReturnValueOnce(appData);
        mockCheckActiveBOExists.mockReturnValueOnce(true);
        mockHasAddedOrCeasedBO.mockReturnValueOnce(hasAddedOrCeased);

        validateStatements(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req['statementErrorList']).toEqual(expectedErrorList);
      });
    });
  });
});
