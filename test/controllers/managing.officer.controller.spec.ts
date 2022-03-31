jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { MANAGING_OFFICER_URL } from "../../src/config";
import { getApplicationData, prepareData, setApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, MANAGING_OFFICER_OBJECT_MOCK } from '../__mocks__/session.mock';
import { ANY_MESSAGE_ERROR, MANAGING_OFFICER_PAGE_HEADING, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { managingOfficerType } from '../../src/model';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("MANAGING_OFFICER controller", () => {

  describe("GET tests", () => {
    test("renders the managing officer page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test("redirects to the next page", async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app).post(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/register-an-overseas-entity/beneficial-owner-type");
    });

    test("adds data to the session", async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app).post(MANAGING_OFFICER_URL);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(beneficialOwnerIndividual.fullName).toEqual("Andrei Nikolayevich Bolkonsky");
      expect(beneficialOwnerIndividual.nationality).toEqual("Russian");
      expect(beneficialOwnerIndividual.businessOccupation).toEqual("Prince");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);

      expect(resp.header.location).toEqual("/register-an-overseas-entity/beneficial-owner-type");
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
