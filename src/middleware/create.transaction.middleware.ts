import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";


import { setTransactionId } from "../utils/session";
import { postTransaction } from '../service/transaction.service';

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const session = req.session as Session;
    // TODO - check if transaction id exists, if not create new one, if it does then what?

    const transaction: Transaction = await postTransaction(req, session);
    logger.infoRequest(req, `Transaction created, ID: ${transaction.id}`);
    // add to session
    setTransactionId(session, transaction.id as string);
    next();

  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};
