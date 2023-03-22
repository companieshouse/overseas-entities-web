import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getApplicationData } from '../utils/application.data';
import { generateTrustId } from '../utils/trust/details.mapper';
import { getTrustArray } from '../utils/trusts';
import { Trust } from '../model/trust.model';
import * as PageModel from '../model/trust.page.model';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';

const ADD_TRUST_TEXTS = {
  title: 'Trusts associated with the overseas entity',
  subtitle: 'Do you need to add another trust?',
};

type TrustInvolvedPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
    subtitle: string;
  },
  pageData: {
    trustData: Trust[]
  },
  formData?: PageModel.AddTrust,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = (
  req: Request,
  formData?: PageModel.AddTrust,
  errors?: FormattedValidationErrors,
): TrustInvolvedPageProperties => {

  const appData = getApplicationData(req.session);

  return {
    backLinkUrl: `${config.BENEFICIAL_OWNER_TYPE_URL}`,
    templateName: config.ADD_TRUST_PAGE,
    pageParams: {
      title: ADD_TRUST_TEXTS.title,
      subtitle: ADD_TRUST_TEXTS.subtitle,
    },
    pageData: {
      trustData: getTrustArray(appData)
    },
    formData,
    errors,
    url: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties(req);

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

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.AddTrust = req.body as PageModel.AddTrust;
    const appData = getApplicationData(req.session);

    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        formData,
        formatValidationError(errorList.array()),
      );
      return res.render(pageProps.templateName, pageProps);
    }

    if (addNewTrust === '1') {
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
