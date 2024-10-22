import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { checkRelevantPeriod, checkRPStatementsExist } from '../../src/utils/relevant.period';
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE,
} from "../__mocks__/session.mock";
import { relevantPeriodType } from '../../src/model';

const appData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  update: {}
};

const mockCheckRelevantPeriod = checkRelevantPeriod as jest.Mock;
const mockCheckRPStatementsExist = checkRPStatementsExist as jest.Mock;

describe('relevant period test suite', () => {
  describe('check relevant period', () => {
    beforeEach (() => {
      jest.clearAllMocks();

      appData.update = {
        change_bo_relevant_period: undefined,
        trustee_involved_relevant_period: undefined,
        change_beneficiary_relevant_period: undefined
      };
    });

    test('should return true if change_bo_relevant_period is selected', () => {
      appData.update = { change_bo_relevant_period: relevantPeriodType.ChangeBoRelevantPeriodType.YES };

      expect(mockCheckRelevantPeriod(appData)).toBeTruthy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", "CHANGE_BO_RELEVANT_PERIOD");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period");
    });

    test('should return true if trustee_involved_relevant_period is selected', () => {
      appData.update = { trustee_involved_relevant_period: relevantPeriodType.TrusteeInvolvedRelevantPeriodType.YES };

      expect(mockCheckRelevantPeriod(appData)).toBeTruthy();

      expect(appData.update).not.toHaveProperty("change_bo_relevant_period");
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", "TRUSTEE_INVOLVED_RELEVANT_PERIOD");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period");
    });

    test('should return true if change_beneficiary_relevant_period is selected', () => {
      appData.update = { change_beneficiary_relevant_period: relevantPeriodType.ChangeBeneficiaryRelevantPeriodType.YES };

      expect(mockCheckRelevantPeriod(appData)).toBeTruthy();

      expect(appData.update).not.toHaveProperty("change_bo_relevant_period");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", "CHANGE_BENEFICIARY_RELEVANT_PERIOD");
    });

    test('should return true if multiple options are selected', () => {
      appData.update = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE;

      expect(mockCheckRelevantPeriod(appData)).toBeTruthy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", "CHANGE_BO_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", "TRUSTEE_INVOLVED_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", "CHANGE_BENEFICIARY_RELEVANT_PERIOD");
    });

    test('should return false if relevant periods are not selected', () => {
      appData.update = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE;

      expect(mockCheckRelevantPeriod(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period");
      expect(appData.update).not.toHaveProperty("change_bo_relevant_period", "CHANGE_BO_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period", "TRUSTEE_INVOLVED_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period", "CHANGE_BENEFICIARY_RELEVANT_PERIOD");
    });

    test('should return false if relevant periods are undefined', () => {
      expect(mockCheckRelevantPeriod(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", undefined);
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", undefined);
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", undefined);
    });

    test('should return false if relevant periods are null', () => {
      appData.update = {
        change_bo_relevant_period: null,
        trustee_involved_relevant_period: null,
        change_beneficiary_relevant_period: null
      };

      expect(mockCheckRelevantPeriod(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", null);
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", null);
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", null);
    });
  });

  describe('check RP statements exists', () => {
    beforeEach (() => {
      jest.clearAllMocks();

      appData.update = {
        change_bo_relevant_period: undefined,
        trustee_involved_relevant_period: undefined,
        change_beneficiary_relevant_period: undefined
      };
    });

    test('should return true if change_bo_relevant_period exists', () => {
      appData.update = { change_bo_relevant_period: relevantPeriodType.ChangeBoRelevantPeriodType.YES };

      expect(mockCheckRPStatementsExist(appData)).toBeTruthy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", "CHANGE_BO_RELEVANT_PERIOD");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period");
    });

    test('should return true if trustee_involved_relevant_period exists', () => {
      appData.update = { trustee_involved_relevant_period: relevantPeriodType.TrusteeInvolvedRelevantPeriodType.YES };

      expect(mockCheckRPStatementsExist(appData)).toBeTruthy();

      expect(appData.update).not.toHaveProperty("change_bo_relevant_period");
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", "TRUSTEE_INVOLVED_RELEVANT_PERIOD");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period");
    });

    test('should return true if change_beneficiary_relevant_period exists', () => {
      appData.update = { change_beneficiary_relevant_period: relevantPeriodType.ChangeBeneficiaryRelevantPeriodType.YES };

      expect(mockCheckRPStatementsExist(appData)).toBeTruthy();

      expect(appData.update).not.toHaveProperty("change_bo_relevant_period");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", "CHANGE_BENEFICIARY_RELEVANT_PERIOD");
    });

    test('should return false if relevant periods are not selected', () => {
      appData.update = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE;

      expect(mockCheckRPStatementsExist(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period");
      expect(appData.update).not.toHaveProperty("change_bo_relevant_period", "CHANGE_BO_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period");
      expect(appData.update).not.toHaveProperty("trustee_involved_relevant_period", "TRUSTEE_INVOLVED_RELEVANT_PERIOD");
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period");
      expect(appData.update).not.toHaveProperty("change_beneficiary_relevant_period", "CHANGE_BENEFICIARY_RELEVANT_PERIOD");
    });

    test('should return false if relevant periods are undefined', () => {
      expect(mockCheckRPStatementsExist(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", undefined);
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", undefined);
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", undefined);
    });

    test('should return false if relevant periods are null', () => {
      appData.update = {
        change_bo_relevant_period: null,
        trustee_involved_relevant_period: null,
        change_beneficiary_relevant_period: null
      };

      expect(mockCheckRPStatementsExist(appData)).toBeFalsy();

      expect(appData.update).toHaveProperty("change_bo_relevant_period", null);
      expect(appData.update).toHaveProperty("trustee_involved_relevant_period", null);
      expect(appData.update).toHaveProperty("change_beneficiary_relevant_period", null);
    });
  });
});
