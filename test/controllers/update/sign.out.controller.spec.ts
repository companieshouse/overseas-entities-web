import { ErrorMessages } from "../../../src/validation/error.messages";

jest.mock("ioredis");
jest.mock("../../../src/utils/logger");

import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_NOT_FOUND_TEXT,
  SERVICE_UNAVAILABLE,
  SIGN_OUT_HINT_TEXT,
  SIGN_OUT_PAGE_TITLE
} from "../../__mocks__/text.mock";

import { createAndLogErrorRequest, logger } from '../../../src/utils/logger';

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;

const previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}`;

describe("Sign Out controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_SIGN_OUT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.UPDATE_AN_OVERSEAS_ENTITY}, the CH search page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage });

      expect(resp.status).toEqual(200);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(0);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });



    test("catch error when posting the page with no selection", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.SIGN_OUT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SIGN_OUT);
    });
  });
});
