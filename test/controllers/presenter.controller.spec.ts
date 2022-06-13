jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { LANDING_URL, PRESENTER_URL } from "../../src/config";
import { getApplicationData, setApplicationData } from "../../src/utils/application.data";
import {
  ANY_MESSAGE_ERROR,
  ENTITY_PAGE_REDIRECT,
  PRESENTER_PAGE_TITLE,
  SERVICE_UNAVAILABLE
} from '../__mocks__/text.mock';
import { PresenterKey } from '../../src/model/presenter.model';
import { PRESENTER_OBJECT_MOCK } from '../__mocks__/session.mock';
import { ErrorMessages } from '../../src/validation/error.messages';
import {
  PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("PRESENTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the presenter page", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [PresenterKey]: PRESENTER_OBJECT_MOCK });
      const resp = await request(app).get(PRESENTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
    });

    test("catch error when renders the presenter page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(PRESENTER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirect the entity page after a succesful post from presenter page", async () => {
      const resp = await request(app).post(PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(ENTITY_PAGE_REDIRECT);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(PRESENTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).toContain(LANDING_URL);
    });

    test("renders the current page with MAX error messages", async () => {
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_FULL_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
    });

    test("renders the current page with INVALID_CHARACTERS error message for full name", async () => {
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain( ErrorMessages.FULL_NAME_PREFIX + ErrorMessages.INVALID_CHARACTERS);
    });

    test("catch error when post data from presenter page", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
