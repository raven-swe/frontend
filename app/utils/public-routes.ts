export const publicRoutePatterns: RegExp[] = [
  /^\/$/,
  /^\/password-reset(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,
  /^\/profile(?:\/.*)?$/,
  /^\/terms-of-service$/,
  /^\/privacy-policy$/,
];

export const isPublicRoute = (path: string) => {
  return publicRoutePatterns.some((regex) => regex.test(path));
};
