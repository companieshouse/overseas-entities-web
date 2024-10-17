jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  // Add userEmail to res.locals to make sign-out url appear
  res.locals.userEmail = "userEmail";
  return next();
});

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe.skip("Remove cannot use this service page", () => {
  test(`renders the ${config.REMOVE_CANNOT_USE_PAGE} page`, async () => {
    const resp = await request(app).get(`${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("You cannot apply to remove this overseas entity");
    expect(resp.text).toContain("https://www.gov.uk/government/organisations/land-registry");
    expect(resp.text).toContain("https://www.ros.gov.uk/our-registers/land-register-of-scotland");
    expect(resp.text).toContain("https://www.nidirect.gov.uk/articles/searching-land-registry");
    expect(resp.text).toContain("https://www.gov.uk/guidance/file-an-overseas-entity-update-statement");
    expect(resp.text).toContain("https://www.gov.uk/contact-companies-house");
    expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SIGN_OUT_PAGE}?page=${config.REMOVE_CANNOT_USE_PAGE}`);
    expect(resp.text).toContain(`${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    expect(resp.text).toContain("What does 'relevant property or land' mean?");
    expect(resp.text).toContain("This means property or land in the UK that was bought on or after:");
    expect(resp.text).toContain("1 January 1999 in England and Wales");
    expect(resp.text).toContain("What to do next");
  });
});
