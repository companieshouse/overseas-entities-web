jest.mock("../../src/middleware/navigation/remove/remove.journey.middleware");

import { NextFunction, Request, Response } from "express";
import { removeJourneyMiddleware } from "../../src/middleware/navigation/remove/remove.journey.middleware";

// get handle on mocked function
const mockRemoveJourneyMiddleware = removeJourneyMiddleware as jest.Mock;

// tell the mock what to return
mockRemoveJourneyMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockRemoveJourneyMiddleware;
