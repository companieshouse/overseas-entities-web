import { checkHasAnyBosWithTrusteeNocs } from '../../../src/utils/update/trusts';

describe('update - trusts utils', () => {
  test('when no BOs have trustee of a trust noc returns false', () => {
    const appData = {};

    const result = checkHasAnyBosWithTrusteeNocs(appData);

    expect(result).toBe(false);
  });

  test('when update individual BOs have trustee of a trust noc returns true', () => {
    const appData = {
      update: {
        review_beneficial_owners_individual: [{ trustees_nature_of_control_types: ['trustee-noc'] }]
      },
    };

    const result = checkHasAnyBosWithTrusteeNocs(appData);

    expect(result).toBe(true);
  });

  test('when update corporate BOs have trustee of a trust noc returns true', () => {
    const appData = {
      update: {
        review_beneficial_owners_corporate: [{ trustees_nature_of_control_types: ['trustee-noc'] }]
      },
    };

    const result = checkHasAnyBosWithTrusteeNocs(appData);

    expect(result).toBe(true);
  });

  test('when individual BOs have trustee of a trust noc returns true', () => {
    const appData = {
      beneficial_owners_individual: [{ trustees_nature_of_control_types: ['trustee-noc'] }]
    };

    const result = checkHasAnyBosWithTrusteeNocs(appData);

    expect(result).toBe(true);
  });

  test('when corporate BOs have trustee of a trust noc returns true', () => {
    const appData = {
      beneficial_owners_corporate: [{ trustees_nature_of_control_types: ['trustee-noc'] }]
    };

    const result = checkHasAnyBosWithTrusteeNocs(appData);

    expect(result).toBe(true);
  });
});
