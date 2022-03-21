export default () => {
  process.env.NODE_ENV = "development";
  process.env.CDN_HOST = "CDN_HOST";
  process.env.COOKIE_SECRET = "123456789123456789123456789";
  process.env.COOKIE_DOMAIN = "test";
  process.env.CACHE_SERVER = "test";
};
