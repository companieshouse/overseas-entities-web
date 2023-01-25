jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
// import request from "supertest";
// import * as config from "../../../src/config";
// import app from "../../../src/app";

// import {
//     UPDATE_DUE_DILIGENCE_PAGE_TITLE
//   } from "../../__mocks__/text.mock";

// import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
// import { DueDiligenceKey, DueDiligenceKeys } from "../../../src/model/due.diligence.model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Update due diligence controller tests", () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("GET tests", () => {
        test("placeholder", async () => {
            expect(1).toEqual(1);
          });
    });

    // describe("POST tests", () => {
    // });
});