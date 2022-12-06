/**
 * check is Trust Functionality is Enabled
 */
import { NextFunction, Request, Response } from "express";
import { constants } from 'http2';
import { isActiveFeature } from "../utils/feature.flag";
import { NOT_FOUND_PAGE } from '../config';

export const isFeatureEnabled = (featureFlagValue: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isActiveFeature(featureFlagValue)) {
      return res
        .status(constants.HTTP_STATUS_NOT_FOUND)
        .render(NOT_FOUND_PAGE);
    }

    // feature is available - show
    return next();
  };
};
