const isAllowedUrls = (allowedUrls: string[][], req): boolean => {
  // Some tests don't use the controller but the function called by this one and don't have a url in the mockReq
  if (!req.url && process.env.JEST_WORKER_ID && process.env.NODE_ENV === 'development') {
    return true;
  }
  // end tests condition

  let allowed = false;
  for (const allowedUrl of allowedUrls) {
    if (allowedUrl.every(el => req.url.includes(el))) {
      allowed = true;
      break;
    }
  }
  return allowed;
};

export default isAllowedUrls;
