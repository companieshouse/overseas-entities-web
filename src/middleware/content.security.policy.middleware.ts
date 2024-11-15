import { HelmetOptions } from "helmet";

export const prepareCSPConfig = (nonce: string): HelmetOptions => {
  const CDN = process.env.CDN_HOST as string;
  const PIWIK_URL = process.env.PIWIK_URL as string;
  const PIWIK_CHS_DOMAIN = process.env.PIWIK_CHS_DOMAIN as string;
  const JQUERY = 'code.jquery.com';
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
        imgSrc: [SELF, CDN, PIWIK_URL],
        styleSrc: [NONCE, CDN],
        connectSrc: [SELF, CDN, PIWIK_URL],
        formAction: [SELF, PIWIK_CHS_DOMAIN],
        scriptSrc: [NONCE, CDN, JQUERY, PIWIK_URL],
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
