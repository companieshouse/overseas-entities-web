import { ErrorMessages } from "../../../src/validation/error.messages";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { createAndLogErrorRequest, logger } from '../../../src/utils/logger';
import * as config from "../../../src/config";
import app from "../../../src/app";

jest.mock("ioredis");
jest.mock("../../../src/utils/logger");

import {
  ANY_MESSAGE_ERROR
} from "../../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}`;

describe("SIGN OUT controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TO BE UPDATED WHEN UAR-267 STORY IS DEVELOPED - will expect a 302

  /*describe("POST tests", () => {
    test(`redirects to ${config.UPDATE_AN_OVERSEAS_ENTITY_URL}, Signs out of Update journey`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage });
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });*/

    test("catch error when posting the page with no selection", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.SIGN_OUT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SIGN_OUT);
    });
  });
});
