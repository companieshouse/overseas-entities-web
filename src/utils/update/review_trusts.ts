import { Trust } from '../../model/trust.model';
import { ApplicationData } from '../../model';
import { TrusteeType } from '../../model/trustee.type.model';

export const getTrustInReview = (appData: ApplicationData) => {
  if (appData.update?.review_trusts) {
    return appData.update?.review_trusts[0];
  }
};

export const getTrusteeIndex = (trust: Trust | undefined, trusteeId: string, trusteeType: string): number => {
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

export const getTrustee = (appData: ApplicationData, trust: Trust, trusteeId: string, trusteeType: string) => {
  const trusteeIndex = getTrusteeIndex(trust, trusteeId, trusteeType);

  if (trusteeIndex < 0) {
    return {};
  }

  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return (trust?.HISTORICAL_BO ?? [])[trusteeIndex];
      case TrusteeType.INDIVIDUAL:
        return (trust?.INDIVIDUALS ?? [])[trusteeIndex];
      case TrusteeType.LEGAL_ENTITY:
        return (trust?.CORPORATES ?? [])[trusteeIndex];
      default:
        return {};
  }
};
