jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/has.presenter.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_AGENT_SELECTED,
  RADIO_BUTTON_SOMEONE_ELSE_SELECTED,
  SERVICE_UNAVAILABLE,
  UK_REGULATED_AGENT,
  WHO_IS_MAKING_UPDATE_PAGE_TITLE,
} from "../../__mocks__/text.mock";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../../src/model/who.is.making.filing.model";
import { hasPresenter } from "../../../src/middleware/navigation/has.presenter.middleware";

const mockHasPresenterMiddleware = hasPresenter as jest.Mock;
mockHasPresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Who is making update controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.WHO_IS_MAKING_UPDATE_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(config.WHO_IS_MAKING_UPDATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_PAGE_TITLE);
      expect(resp.text).not.toContain(RADIO_BUTTON_AGENT_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UK_REGULATED_AGENT);
    });

    test(`renders the ${config.WHO_IS_MAKING_UPDATE_PAGE} page with radios selected to ${WhoIsRegisteringType.AGENT}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
      const resp = await request(app).get(config.WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_AGENT_SELECTED);
    });

    test(`renders the ${config.WHO_IS_MAKING_UPDATE_PAGE} page with radios selected to ${WhoIsRegisteringType.SOMEONE_ELSE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });
      const resp = await request(app).get(config.WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_WHO_IS_MAKING_FILING);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.WHO_IS_MAKING_UPDATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
