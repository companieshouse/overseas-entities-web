import { TrustWhoIsInvolved } from '../../model/trust.page.model';
import { getTrustBoIndividuals, getTrustBoOthers, getLegalEntityBosInTrust } from '../../utils/trusts';
import * as mapperBeneficialOwner from '../../utils/trust/beneficial.owner.mapper';
import * as trustLegalEntityMapper from '../../utils/trust/legal.entity.beneficial.owner.mapper';
import { ApplicationData } from '.../../model';

const mapTrustWhoIsInvolvedToPage = (
  appData: ApplicationData,
  trustId: string,
  isReview: boolean
): TrustWhoIsInvolved => {
  const boInTrust = [
    ...getTrustBoIndividuals(appData, trustId)
      .map(mapperBeneficialOwner.mapBoIndividualToPage),
    ...getTrustBoOthers(appData, trustId)
      .map(mapperBeneficialOwner.mapBoOtherToPage),
  ];

  const trustees = [
    ...getLegalEntityBosInTrust(appData, trustId, isReview)
      .map(trustLegalEntityMapper.mapLegalEntityItemToPage)
  ];

  return {
    boInTrust,
    trustees,
  };
};

export {
  mapTrustWhoIsInvolvedToPage,
};
