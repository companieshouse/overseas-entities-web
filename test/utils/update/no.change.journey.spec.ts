jest.mock("../../../src/utils/feature.flag" );

import { isNoChangeJourney } from "../../../src/utils/update/no.change.journey";
import {
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE
} from "../../__mocks__/session.mock";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { jest } from "@jest/globals";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe('Test add resign date to template', () => {

  test(`on change journey when feature flag is off with update changes`, () => {
    expect (isNoChangeJourney({ update: { no_change: false } }))
      .toEqual(false);
  });

  test(`on no change journey when feature flag is off with no update changes`, () => {
    expect (isNoChangeJourney({ update: { no_change: true } }))
      .toEqual(true);
  });

  test(`on change journey when feature flag is on, with update changes and relevant period changes`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    expect (isNoChangeJourney({ update: { ...UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE, no_change: false } }))
      .toEqual(false);
  });

  test(`on change journey when feature flag is on, with no update changes and relevant period changes`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    expect (isNoChangeJourney({ update: { ...UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE, no_change: true } }))
      .toEqual(false);
  });

  test(`on change journey when feature flag is on, with update changes and no relevant period changes`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    expect (isNoChangeJourney({ update: { ...UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE, no_change: false } }))
      .toEqual(false);
  });

  test(`on no change journey when feature flag is on, with no update changes and no relevant period changes`, () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    expect (isNoChangeJourney({ update: { ...UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE, no_change: true } }))
      .toEqual(true);
  });
});

