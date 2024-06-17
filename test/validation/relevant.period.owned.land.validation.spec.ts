
const mockNot = jest.fn();
const mockIsEmpty = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    not: mockNot.mockReturnThis(),
    isEmpty: mockIsEmpty.mockReturnThis()
  })),
}));

import { OwnedLandKey } from "../../src/model/relevant.period.owned.land.filter.model";
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
  });
});
