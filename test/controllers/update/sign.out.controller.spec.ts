import { ErrorMessages } from "../../../src/validation/error.messages";

jest.mock("ioredis");
jest.mock("../../../src/utils/logger");

import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { createAndLogErrorRequest, logger } from '../../../src/utils/logger';
import * as config from "../../../src/config";
import app from "../../../src/app";

import {
  ANY_MESSAGE_ERROR,
  SIGN_OUT_HINT_TEXT,
  SIGN_OUT_PAGE_TITLE
} from "../../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`;

describe("SIGN OUT controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("GET tests", () => {
    test(`renders the ${config.SIGN_OUT_PAGE} page, with ${config.SECURE_UPDATE_FILTER_PAGE} as back link`, async () => {
      const resp = await request(app)
        .get(`${config.UPDATE_SIGN_OUT_URL}?page=${config.SECURE_UPDATE_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`);

    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, with ${config.SECURE_UPDATE_FILTER_PAGE} as back link`, async () => {
      const resp = await request(app)
        .get(`${config.UPDATE_SIGN_OUT_URL}?page=${config.SECURE_UPDATE_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`);
    });

  });
  // TO BE UPDATED WHEN UAR-267 STORY IS DEVELOPED

  describe("POST tests", () => {
    test(`redirects to ${config.UPDATE_AN_OVERSEAS_ENTITY_URL}, Signs out of Update journey`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage });
      expect(resp.status).toEqual(302);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test("catch error when posting the page with no selection", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_SIGN_OUT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SIGN_OUT);
    });

  });
});
