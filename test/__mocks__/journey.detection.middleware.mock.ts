jest.mock("../../src/middleware/navigation/journey.detection.middleware");

import { NextFunction, Request, Response } from "express";
import { journeyDetectionMiddleware } from "../../src/middleware/navigation/journey.detection.middleware";

// get handle on mocked function
const mockJourneyDetectionMiddleware = journeyDetectionMiddleware as jest.Mock;

// tell the mock what to return
mockJourneyDetectionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockJourneyDetectionMiddleware;
