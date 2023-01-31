jest.mock("ioredis");
jest.mock("../../../src/middleware/authentication.middleware");
jest.mock("../../../src/utils/application.data");
jest.mock('../../../src/middleware/navigation/update/has.who.is.making.update.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { hasWhoIsMakingUpdate } from "../../../src/middleware/navigation/update/has.who.is.making.update.middleware";
import { OverseasEntityDueDiligenceKey } from "../../../src/model/overseas.entity.due.diligence.model";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, setApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";

import {
  OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK
} from "../../__mocks__/overseas.entity.due.diligence.mock";

import {
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
  WHO_IS_MAKING_UPDATE_URL,
} from "../../../src/config";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE,
  OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT,
  OVERSEAS_ENTITY_NO_EMAIL_OR_VERIFICATION_DATE_SHOWN_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT,
  OVERSEAS_ENTITY_DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
} from "../../__mocks__/text.mock";

const mockHasWhoIsMakingUpdate = hasWhoIsMakingUpdate as jest.Mock;
mockHasWhoIsMakingUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [OverseasEntityDueDiligenceKey]: null } );
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT);
      expect(resp.text).toContain(OVERSEAS_ENTITY_NO_EMAIL_OR_VERIFICATION_DATE_SHOWN_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page on GET method with session data populated`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } );
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK.partner_name);
    });

    test(`catch error when renders the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page on GET method`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  // TO DO: POST tests
});
