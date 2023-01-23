import { TrustWhoIsInvolved } from '../../model/trust.page.model';
import { getTrustBoIndividuals, getTrustBoOthers } from '../../utils/trusts';
import * as mapperBeneficialOwner from '../../utils/trust/beneficial.owner.mapper';
import { ApplicationData } from '.../../model';

const mapTrustWhoIsInvolvedToPage = (
  appData: ApplicationData,
  trustId: string,
): TrustWhoIsInvolved => {
  const boInTrust = [
    ...getTrustBoIndividuals(appData, trustId)
      .map(mapperBeneficialOwner.mapBoIndividualToPage),
    ...getTrustBoOthers(appData, trustId)
      .map(mapperBeneficialOwner.mapBoOtherToPage),
  ];

  return {
    boInTrust,
  };
};

export {
  mapTrustWhoIsInvolvedToPage,
};
