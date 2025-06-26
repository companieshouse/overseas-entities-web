const expectResult = 'dummyValue';

const mockNot = jest.fn();
const mockIsEmpty = jest.fn();
const mockWithMessage = jest.fn().mockReturnValue(expectResult);

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    not: mockNot.mockReturnThis(),
    isEmpty: mockIsEmpty.mockReturnThis(),
    withMessage: mockWithMessage
  })),
}));

import { ProvideInformation } from "../../src/model/update.type.model";
import * as provideInformationHelper from "../../src/validation/relevant.period.provide.information.now.or.later.validation";

const provideInformation = ProvideInformation;

describe('Relevant period provide information page validation test', () => {
  // Arrange
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('should validate field successfully', () => {
    // Act
    provideInformationHelper.relevantPeriodProvideInformation;

    // Assert
    expect(provideInformation).toBeTruthy;
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
  });
});
