jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SERVICE_UNAVAILABLE,
  SOLD_LAND_FILTER_PAGE_TITLE,
} from "../__mocks__/text.mock";

import {
  APPLICATION_DATA_MOCK,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID
} from "../__mocks__/session.mock";

import { ErrorMessages } from '../../src/validation/error.messages';

import { deleteApplicationData, getApplicationData, setExtraData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { createOverseasEntity, updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { postTransaction } from "../../src/service/transaction.service";

mockCsrfProtectionMiddleware.mockClear();
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue(TRANSACTION_ID);

const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;
mockCreateOverseasEntity.mockReturnValue(OVERSEAS_ENTITY_ID);

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("SOLD LAND FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
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
      mockGetApplicationData.mockReturnValue({ has_sold_land: 0 });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page with radios selected to yes`, async () => {
      mockGetApplicationData.mockReturnValue({ has_sold_land: 1 });
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page, and calling the deleteApplicationData
     if the following query param is present ${config.LANDING_PAGE_QUERY_PARAM}=0`, async () => {
      mockGetApplicationData.mockReturnValue({ });
      const resp = await request(app)
        .get(`${config.SOLD_LAND_FILTER_URL}?${config.LANDING_PAGE_QUERY_PARAM}=0`);

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
  });

  describe("POST tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '1' });
      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.SECURE_REGISTER_FILTER_PAGE} page when no is selected and REDIS_removal flag is OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.SECURE_REGISTER_FILTER_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test.only(`creates transaction and overseas entity and redirects to the ${config.SECURE_REGISTER_FILTER_PAGE} page when no is selected and REDIS_removal flag is ON`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app).post(config.SOLD_LAND_FILTER_URL).send({ has_sold_land: '0' });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
    });

    test(`creates transaction and entity and redirects to the ${config.SECURE_REGISTER_FILTER_PAGE} page when no is selected and REDIS_removal flag is ON`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app).post(config.SOLD_LAND_FILTER_URL).send({ has_sold_land: '0' });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
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
