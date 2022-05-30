jest.mock("ioredis");
jest.mock("../../src/utils/application.data");

import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";
import { SOLD_LAND_FILTER_PAGE_TITLE } from "../__mocks__/text.mock";
import { ErrorMessages } from '../../src/validation/error.messages';

describe("SOLD LAND FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.SOLD_LAND_FILTER_PAGE} page`, async () => {
      const resp = await request(app).get(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '1' });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("You cannot use this service");
    });

    test(`redirects to the ${config.INTERRUPT_CARD_PAGE} page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL)
        .send({ has_sold_land: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.INTERRUPT_CARD_PAGE);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.SOLD_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SOLD_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ENTITY_HAS_SOLD_LAND);
    });
  });
});
