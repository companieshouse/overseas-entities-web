jest.mock("ioredis");
jest.mock("../../src/utils/application.data");

import { INTERRUPT_CARD_PAGE, INTERRUPT_CARD_URL, PRESENTER_URL } from "../../src/config";
import request from "supertest";
import app from "../../src/app";
import { ANY_MESSAGE_ERROR, INTERRUPT_CARD_PAGE_TITLE, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { deleteApplicationData } from "../../src/utils/application.data";
import { logger } from "../../src/utils/logger";

const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

describe("INTERRUPT CARD controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${INTERRUPT_CARD_PAGE} page`, async () => {
      const resp = await request(app).get(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
    });

    test(`makes call to delete application data`, async () => {
      const resp = await request(app).get(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      expect(mockDeleteApplicationData).toBeCalledTimes(1);
    });

    test(`catch error when renders the ${INTERRUPT_CARD_PAGE} page on GET method`, async () => {
      mockDeleteApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`Redirect to ${PRESENTER_URL} after a successful post from ${INTERRUPT_CARD_PAGE} page`, async () => {
      const resp = await request(app)
        .post(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(PRESENTER_URL);
    });

    test(`catch error when POST on the ${INTERRUPT_CARD_PAGE} page`, async () => {
      const originalLoggerFn = logger.debugRequest;
      logger.debugRequest = jest.fn().mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(INTERRUPT_CARD_URL);
      logger.debugRequest = originalLoggerFn;

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
