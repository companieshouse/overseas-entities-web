import { NextFunction, Request, Response } from "express";
import { constants } from 'http2';
import { isActiveFeature } from "../utils/feature.flag";
import { NOT_FOUND_PAGE } from '../config';

export const isFeatureDisabled = (featureFlagValue: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isActiveFeature(featureFlagValue)) {
      return next();
    }

    return res.status(constants.HTTP_STATUS_NOT_FOUND).render(NOT_FOUND_PAGE);
  };
};
