import { ApplicationData } from "model";

export const checkHasAnyBosWithTrusteeNocs = (appData: ApplicationData) => {
  const bosThatCanHaveTrusteeNoc = [
    ...(appData.beneficial_owners_individual || []),
    ...(appData.beneficial_owners_corporate || []),
    ...(appData.update?.review_beneficial_owners_individual || []),
    ...(appData.update?.review_beneficial_owners_corporate || []),
  ];

  return bosThatCanHaveTrusteeNoc.some(bo => bo.trustees_nature_of_control_types?.length);
};
