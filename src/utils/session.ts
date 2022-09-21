import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';
import { SignInInfoKeys } from '@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys';
import { UserProfileKeys } from '@companieshouse/node-session-handler//lib/session/keys/UserProfileKeys';
import { ISignInInfo } from '@companieshouse/node-session-handler/lib/session/model/SessionInterfaces';
import { AccessTokenKeys } from '@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys';
import { TRANSACTION_ID_KEY, SUBMISSION_ID_KEY } from '../model/application.model';

const getSignInInfo = (session): ISignInInfo => {
  return session?.data?.[SessionKey.SignInInfo];
};

export const getLoggedInUserEmail = (session): string => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.Email] as string;
};

export const checkUserSignedIn = (session): boolean => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.SignedIn] === 1;
};

export const getAccessToken = (session): string => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
};

export const setTransactionId = (session, transactionId: string): void => {
  return session?.setExtraData(TRANSACTION_ID_KEY, transactionId);
};

export const getTransactionId = (session): string => {
  return session?.getExtraData(TRANSACTION_ID_KEY) as string;
};

export const setSubmissionId = (session, submissionId: string): void => {
  return session?.setExtraData(SUBMISSION_ID_KEY, submissionId);
};

export const getSubmissionId = (session): string => {
  return session?.getExtraData(SUBMISSION_ID_KEY) as string;
};
