jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/feature.flag');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import {
  ANY_MESSAGE_ERROR,
  LANDING_LINK,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SERVICE_UNAVAILABLE,
  SOLD_LAND_FILTER_PAGE_TITLE,
  STARTING_NEW_LINK,
} from "../__mocks__/text.mock";
import { ErrorMessages } from '../../src/validation/error.messages';

import { deleteApplicationData, getApplicationData, setExtraData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";
import { LANDING_PAGE_QUERY_PARAM } from "../../src/model/data.types.model";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

describe("SOLD LAND FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page with radios selected to no`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ has_sold_land: 0 });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page with radios selected to yes`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ has_sold_land: 1 });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page, and calling the deleteApplicationData
     if the following query param is present ${LANDING_PAGE_QUERY_PARAM}=0`, async () => {
      const resp = await request(app)
        .get(`${config.SOLD_LAND_FILTER_URL}?${LANDING_PAGE_QUERY_PARAM}=0`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(mockDeleteApplicationData).toBeCalledTimes(1);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page with updated back link when 
      save and resume feature flag is active`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // SHOW_SERVICE_OFFLINE_PAGE
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_UPDATE
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(STARTING_NEW_LINK); // back button
      // page heading will contain LANDING_LINK so remove this to check back button link isn't set to LANDING_LINK
      const respTextWithFirstLandingLinkRemoved = resp.text.replace(LANDING_LINK, " ");
      expect(respTextWithFirstLandingLinkRemoved).not.toContain(LANDING_LINK);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page with original back link when 
      save and resume feature flag is inactive`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // SHOW_SERVICE_OFFLINE_PAGE
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_ROE_UPDATE
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_LINK); // back button
      expect(resp.text).not.toContain(STARTING_NEW_LINK); // back button
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '1' });
      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.SECURE_REGISTER_FILTER_PAGE} page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.SECURE_REGISTER_FILTER_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ENTITY_HAS_SOLD_LAND);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.SOLD_LAND_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '0' });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
