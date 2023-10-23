import { BeneficialOwnerIndividual } from '../../model/beneficial.owner.individual.model';
import * as Page from '../../model/trust.page.model';
import { BeneficialOwnerTypeChoice } from '../../model/beneficial.owner.type.model';
import { BeneficialOwnerOther } from '../../model/beneficial.owner.other.model';

const mapBoIndividualToPage = (
  beneficialOwner: BeneficialOwnerIndividual,
): Page.TrustBeneficialOwnerListItem => {
  return {
    id: beneficialOwner.id,
    name: [beneficialOwner.first_name, beneficialOwner.last_name].join(' '),
    type: BeneficialOwnerTypeChoice.individual,
    is_newly_added: beneficialOwner.ch_reference ? false : true
  };
};

const mapBoOtherToPage = (
  beneficialOwner: BeneficialOwnerOther,
): Page.TrustBeneficialOwnerListItem => {
  return {
    id: beneficialOwner.id,
    name: beneficialOwner.name || "",
    type: BeneficialOwnerTypeChoice.otherLegal,
    is_newly_added: beneficialOwner.ch_reference ? false : true
  };
};

export {
  mapBoIndividualToPage,
  mapBoOtherToPage,
};
