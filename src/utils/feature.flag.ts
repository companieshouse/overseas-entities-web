/**
 * Feature flags will be determined by environment variables and all environment variables in nodejs are
 * either string or undefined.
 * This function will ensure that 'true', '1', 'on' will be Truthy
 */
export const isActiveFeature = (flag: string | undefined): boolean => {
  return ['1', 'true', 'on'].includes(flag?.toString().toLowerCase() ?? '');
};
