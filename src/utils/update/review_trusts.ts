import { Trust } from '../../model/trust.model';
import { ApplicationData } from '../../model';
import { TrusteeType } from '../../model/trustee.type.model';

export const hasTrustsToReview = (appData: ApplicationData) =>
  (appData.update?.review_trusts ?? []).length > 0;

export const getTrustInReview = (appData: ApplicationData) =>
  (appData.update?.review_trusts ?? []).find(trust => !!trust.review_status?.in_review);

export const getReviewTrustById = (appData: ApplicationData, trustId: string) =>
  appData.update?.review_trusts?.find(trust => trust.trust_id === trustId) ?? {};

export const updateTrustInReviewList = (appData: ApplicationData, trustToSave: Trust) => {
  const trusts: Trust[] = appData.update?.review_trusts ?? [];
  const trustIndex: number = trusts.findIndex((trust: Trust) => trust.trust_id === trustToSave.trust_id);
  trusts[trustIndex] = trustToSave;
};

export const putNextTrustInReview = (appData: ApplicationData) => {
  const trustToReview = (appData.update?.review_trusts ?? [])[0];

  if (trustToReview) {
    trustToReview.review_status = {
      in_review: true,
      reviewed_trust_details: false,
      reviewed_former_bos: false,
      reviewed_individuals: false,
      reviewed_legal_entities: false,
    };
  }

  return trustToReview;
};

export const setTrustDetailsAsReviewed = (appData: ApplicationData) => {
  const trust = getTrustInReview(appData);

  if (!trust?.review_status) {
    return false;
  }

  trust.review_status.reviewed_trust_details = true;

  return true;
};

export const hasTrusteesToReview = (trust: Trust | undefined, trusteeType: string) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return !trust?.review_status?.reviewed_former_bos && (trust?.HISTORICAL_BO ?? []).length > 0;
      case TrusteeType.INDIVIDUAL:
        return !trust?.review_status?.reviewed_individuals && (trust?.INDIVIDUALS ?? []).length > 0;
      case TrusteeType.LEGAL_ENTITY:
        return !trust?.review_status?.reviewed_legal_entities && (trust?.CORPORATES ?? []).length > 0;
      default:
        return false;
  }
};

export const getTrusteeIndex = (trust: Trust | undefined, trusteeId: string, trusteeType: string) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return (trust?.HISTORICAL_BO ?? []).findIndex(trustee => trustee.id === trusteeId);
      case TrusteeType.INDIVIDUAL:
        return (trust?.INDIVIDUALS ?? []).findIndex(trustee => trustee.id === trusteeId);
      case TrusteeType.LEGAL_ENTITY:
        return (trust?.CORPORATES ?? []).findIndex(trustee => trustee.id === trusteeId);
      default:
        return -1;
  }
};

export const getTrustee = (trust: Trust | undefined, trusteeId: string, trusteeType: string) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return (trust?.HISTORICAL_BO ?? []).find(trustee => trustee.id === trusteeId);
      case TrusteeType.INDIVIDUAL:
        return (trust?.INDIVIDUALS ?? []).find(trustee => trustee.id === trusteeId);
      case TrusteeType.LEGAL_ENTITY:
        return (trust?.CORPORATES ?? []).find(trustee => trustee.id === trusteeId);
      default:
        return undefined;
  }
};

export const setTrusteesAsReviewed = (appData: ApplicationData, trusteeType: TrusteeType) => {
  const trust = getTrustInReview(appData);

  if (!trust?.review_status) {
    return false;
  }

  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        trust.review_status.reviewed_former_bos = true;
        return true;
      case TrusteeType.INDIVIDUAL:
        trust.review_status.reviewed_individuals = true;
        return true;
      case TrusteeType.LEGAL_ENTITY:
        trust.review_status.reviewed_legal_entities = true;
        return true;
      default:
        return false;
  }
};

export const moveTrustOutOfReview = (appData: ApplicationData) => {
  const trustIndex = (appData.update?.review_trusts ?? []).findIndex(trust => trust?.review_status?.in_review);
  const trust = appData.update?.review_trusts?.splice(trustIndex, 1)[0];

  if (!trust) { return; }

  delete trust.review_status;

  if (appData.trusts === undefined) {
    appData.trusts = [];
  }

  appData.trusts?.push(trust);
};
