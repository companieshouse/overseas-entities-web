import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getApplicationData } from '../utils/application.data';
import { generateTrustId } from '../utils/trust/details.mapper';

const ADD_TRUST_TEXTS = {
  title: 'Do you need to add another trust?',
};

type TrustInvolvedPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
  },
};

const getPageProperties = (
): TrustInvolvedPageProperties => {

  return {
    backLinkUrl: `${config.BENEFICIAL_OWNER_TYPE_URL}`,
    templateName: config.ADD_TRUST_PAGE,
    pageParams: {
      title: ADD_TRUST_TEXTS.title,
    },
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties();

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const post = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debugRequest(req, `POST ${config.ADD_TRUST_PAGE}`);
    const addNewTrust = req.body["addTrust"];

    if (addNewTrust === '1') {
      const appData = getApplicationData(req.session);
      const newTrustId = generateTrustId(appData);

      return res.redirect(`${config.TRUST_DETAILS_URL}/${newTrustId}`);
    } else {
      return res.redirect(config.CHECK_YOUR_ANSWERS_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export {
  get,
  post,
  ADD_TRUST_TEXTS,
};
