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

import { OwnedLandKey } from "../../src/model/update.type.model";
import * as ownedLandHelper from "../../src/validation/relevant.period.owned.land.validation";

const ownedLandKey = OwnedLandKey;

describe('Overseas entity was registered owner of UK land during relevant period page validation test', () => {
  // Arrange
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('should validate field successfully', () => {
    // Act
    ownedLandHelper.relevantPeriodOwnedLandFilter;

    // Assert
    expect(ownedLandKey).toBeTruthy;
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
  });
});
