import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  PAGE_TITLE_ERROR,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE,
} from "../../__mocks__/text.mock";
import { REMOVE_SERVICE_NAME } from "../../../src/config";

describe("Remove sold all land filter controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page`, async () => {
      const resp = await request(app).get(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });
  });
});
