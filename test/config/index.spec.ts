import { getEnvironmentValue, CDN_HOST } from "../../src/config";

describe('Config test suite', () => {
  it('should check if CDN_HOST env is returned correctly and fetched from user environment', () => {
    const test_cdn_host = getEnvironmentValue("CDN_HOST");
    expect(test_cdn_host).toEqual(CDN_HOST);
  });

  it('should throw an error when passing anyNonExistingEnv to getEnvironmentValue()', () => {
    const fakeEnv = 'anyNonExistingEnv';
    expect(() => getEnvironmentValue(fakeEnv)).toThrow(`Please set the environment variable "${fakeEnv}"`);
  });

  it('should return the optional value when process.env[key] is blank', () => {
    const optionalPort = "3000";
    const test_port = getEnvironmentValue("", optionalPort);
    expect(test_port).toEqual(optionalPort);
  });
});
