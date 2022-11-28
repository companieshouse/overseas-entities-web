import { NextFunction } from "express";
import { UPDATE_COMPANY_PROFILES_URL } from "../../src/config";
import { EntityKey } from "../../src/model/entity.model";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { COMPANY_NUMBER } from "../__mocks__/session.mock";
import request from "supertest";

import app from "../../src/app";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { authentication } from "../../src/middleware/authentication.middleware";


const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })

  describe("Get company data by Id", () => {
    test("Retrieve company data", async () => {
      mockGetApplicationData.mockReturnValueOnce( { [EntityKey]: null } );
      const resp = await request(app).get(UPDATE_COMPANY_PROFILES_URL + COMPANY_NUMBER);

      expect(resp.status).toEqual(200);

    })
  })
})