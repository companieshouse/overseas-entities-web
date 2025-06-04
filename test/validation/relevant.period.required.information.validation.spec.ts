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

import { RequiredInformation } from "../../src/model/update.type.model";
import * as requiredInformationHelper from "../../src/validation/relevant.period.required.information.validation";

const requiredInformation = RequiredInformation;

describe('Relevant period required information page validation test', () => {
  // Arrange
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('should validate field successfully', () => {
    // Act
    requiredInformationHelper.relevantPeriodRequiredInformation;

    // Assert
    expect(requiredInformation).toBeTruthy;
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
  });
});
