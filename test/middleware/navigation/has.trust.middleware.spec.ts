jest.mock(".../../../src/utils/application.data");
jest.mock("ioredis");

import { Request, Response } from "express";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { hasTrust } from "../../../src/middleware/navigation/has.trust.middleware";
import { Session } from "@companieshouse/node-session-handler";
import { Params } from "express-serve-static-core";
import { ANY_MESSAGE_ERROR } from "../../__mocks__/text.mock";
import { APPLICATION_DATA_WITH_TRUST_ID_MOCK, TRUST_WITH_ID } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { SOLD_LAND_FILTER_URL } from "../../../src/config";

describe("HasTrust Middleware tests", () => {
  let req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis() as any,
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const next = jest.fn();

  beforeEach(() => {
    logger.infoRequest = jest.fn();

    jest.clearAllMocks();
  });

  test("Trust present, return next", () => {
    req = {
      params: {
        trustId: TRUST_WITH_ID.trust_id,
      } as Params,
      session: {} as Session,
      route: "",
      method: "",
    } as Request;

    (getApplicationData as jest.Mock).mockReturnValue(
      APPLICATION_DATA_WITH_TRUST_ID_MOCK
    );

    hasTrust(req, res, next);

    expect(next).toBeCalled();
    expect(res.redirect).not.toBeCalled();
  });

  test("Trust not present, redirect to landing page", () => {
    req = {
      params: {
        id: "otherID",
      } as Params,
      session: {} as Session,
      route: "",
      method: "",
    } as Request;

    (getApplicationData as jest.Mock).mockReturnValue(
      APPLICATION_DATA_WITH_TRUST_ID_MOCK
    );

    hasTrust(req, res, next);

    expect(res.redirect).toBeCalled();
    expect(res.redirect).toBeCalledWith(SOLD_LAND_FILTER_URL);
    expect(next).not.toBeCalled();
  });

  test("catch error when renders the page", () => {
    req = {
      params: {
        id: "otherID",
      } as Params,
      session: {} as Session,
      route: "",
      method: "",
    } as Request;

    const error = new Error(ANY_MESSAGE_ERROR);
    (getApplicationData as jest.Mock).mockImplementationOnce(() => {
      throw error;
    });

    hasTrust(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(error);
  });
});
