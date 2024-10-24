import { HelmetOptions } from "helmet";

export const prepareCSPConfig = (nonce: string): HelmetOptions => {
  const CDN = process.env.CDN_HOST as string;
  const PIWIK_URL = process.env.PIWIK_URL as string;
  const SELF = `'self'`;
  const NONCE = `'nonce-${nonce}'`;
  const ONE_YEAR_SECONDS = 31536000;

  return {
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: null,
        defaultSrc: [SELF],
        fontSrc: [CDN],
        frameAncestors: [SELF],
        imgSrc: [SELF, CDN],
        styleSrc: [NONCE, CDN],
        connectSrc: [SELF, CDN, PIWIK_URL],
        scriptSrc: [NONCE, CDN, PIWIK_URL],
        objectSrc: ["'none'"],
      }
    },
    referrerPolicy: {
      policy: ["same-origin"]
    },
    hsts: {
      maxAge: ONE_YEAR_SECONDS,
      includeSubDomains: true
    }
  };
};
