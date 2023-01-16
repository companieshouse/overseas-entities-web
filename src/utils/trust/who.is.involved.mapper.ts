import { Trust, TrustKey } from '../../model/trust.model';
import { TrustWhoIsInvolved } from '../../model/trust.page.model';
import { getTrustBoIndividuals, getTrustBoOthers } from '../../utils/trusts';
import * as mapperBeneficialOwner from '../../utils/trust/beneficial.owner.mapper';
import { ApplicationData } from '.../../model';

const mapTrustWhoIsInvolvedToPage = (
  appData: ApplicationData,
  trustId: string,
): TrustWhoIsInvolved => {
  const data = appData[TrustKey]?.find(trust => trust.trust_id === trustId) ?? {} as Trust;

  const boInTrust = [
    ...getTrustBoIndividuals(appData, trustId)
      .map(mapperBeneficialOwner.mapBoIndividualToPage),
    ...getTrustBoOthers(appData, trustId)
      .map(mapperBeneficialOwner.mapBoOtherToPage),
  ];

  return {
    trustId: data.trust_id,
    trustName: data.trust_name,
    boInTrust,
  };
};

export {
  mapTrustWhoIsInvolvedToPage,
};
