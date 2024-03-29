jest.mock("ioredis");
jest.mock("../../src/utils/feature.flag" );

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import {
  RESUME,
  STARTING_NEW_URL,
  REMOVE_CANNOT_USE_PAGE,
  REMOVE_CANNOT_USE_URL,
  PREVIOUS_PAGE_QUERY_PARAM,
  REMOVE_SOLD_ALL_LAND_FILTER_PAGE,
  REMOVE_SOLD_ALL_LAND_FILTER_URL,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
  REMOVE_CONFIRM_STATEMENT_PAGE,
  REMOVE_CONFIRM_STATEMENT_URL,
  SECURE_UPDATE_FILTER_URL
} from "../../src/config";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { RESUME_SUBMISSION_URL } from '../__mocks__/session.mock';
import { FOUND_REDIRECT_TO } from '../__mocks__/text.mock';

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("service availability middleware tests", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test("should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });

  test("update disabled should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const response = await request(app).get("/update-an-overseas-entity");

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test("update enabled should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false).mockReturnValueOnce(true);
    const response = await request(app).get("/update-an-overseas-entity");

    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });

  test(`should return service offline page when req.path is equal ${STARTING_NEW_URL} and save and resume flag disabled `, async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const response = await request(app).get(STARTING_NEW_URL);

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test(`should redirect to signin page after next middleware (authentication) when req.path is equal ${STARTING_NEW_URL} and save and resume flag enabled `, async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    const response = await request(app).get(STARTING_NEW_URL);

    expect(response.status).toEqual(302);
    expect(response.text).toEqual(`${FOUND_REDIRECT_TO} /signin?return_to=${STARTING_NEW_URL}`);
    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });

  test(`should return service offline page when req.path ends with '/${RESUME}' and save and resume flag disabled `, async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const response = await request(app).get(RESUME_SUBMISSION_URL);

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test(`should redirect to signin page after next middleware (authentication) when req.path ends with '/${RESUME}' and save and resume flag enabled `, async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    const response = await request(app).get(RESUME_SUBMISSION_URL);

    expect(response.status).toEqual(302);
    expect(response.text).toEqual(`${FOUND_REDIRECT_TO} /signin?return_to=${RESUME_SUBMISSION_URL}`);
    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });

  test("When Remove feature flag disabled, should return service offline page when query param journey=remove", async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
      .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
      .mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_REMOVE
    const response = await request(app).get("/update-an-overseas-entity/somepage?journey=remove");

    expect(response.text).toContain("Service offline - Apply to remove an overseas entity from the register");
  });

  test("When Remove feature flag enabled, should NOT return service offline page when query param journey=remove", async () => {
    mockIsActiveFeature
      .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
      .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
      .mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_ROE_REMOVE
    const response = await request(app).get("/update-an-overseas-entity/somepage?journey=remove");

    expect(response.text).not.toContain("Service offline - Apply to remove an overseas entity from the register");
  });

  describe("Remove feature flag tests for remove specific pages", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test(`Redirects to the next page whenever the remove flag is true`, async () => {
      mockIsActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
        .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
        .mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_ROE_REMOVE
      const resp = await request(app).get(`${REMOVE_CANNOT_USE_URL}?${PREVIOUS_PAGE_QUERY_PARAM}=${REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`/signin?return_to=${SECURE_UPDATE_FILTER_URL}`);
    });

    test(`Does not reach the ${REMOVE_CANNOT_USE_PAGE} when the remove flag is false`, async () => {
      mockIsActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
        .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
        .mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_REMOVE
      const resp = await request(app).get(`${REMOVE_CANNOT_USE_URL}?${PREVIOUS_PAGE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("You cannot apply to remove this overseas entity");
      expect(resp.text).toContain("Sorry, the service is unavailable");
    });

    test(`Does not reach the ${REMOVE_SOLD_ALL_LAND_FILTER_PAGE} when the remove flag is false`, async () => {
      mockIsActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
        .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
        .mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_REMOVE
      const resp = await request(app).get(`${REMOVE_SOLD_ALL_LAND_FILTER_URL}?${PREVIOUS_PAGE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Has the overseas entity disposed of all its property or land in the UK?");
      expect(resp.text).toContain("Sorry, the service is unavailable");
    });

    test(`Does not reach the ${REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} when the remove flag is false`, async () => {
      mockIsActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
        .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
        .mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_REMOVE
      const resp = await request(app).get(`${REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}?${PREVIOUS_PAGE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Is the overseas entity currently listed on any land registry records as the registered owner of property or land in the UK?");
      expect(resp.text).toContain("Sorry, the service is unavailable");
    });

    test(`Does not reach the ${REMOVE_CONFIRM_STATEMENT_PAGE} page when the remove flag is false`, async () => {
      mockIsActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_OFFLINE_PAGE
        .mockReturnValueOnce(true) // FEATURE_FLAG_ENABLE_ROE_UPDATE
        .mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_REMOVE
      const resp = await request(app).get(`${REMOVE_CONFIRM_STATEMENT_URL}?${PREVIOUS_PAGE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("Confirm the removal statement - Apply to remove an overseas entity");
      expect(resp.text).toContain("Sorry, the service is unavailable");
    });
  });
});
