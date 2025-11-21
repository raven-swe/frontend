export const publicRoutePatterns: RegExp[] = [
  /^\/$/,
  /^\/password-reset(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,
  /^\/profile(?:\/.*)?$/,
];

export const isPublicRoute = (path: string) => {
  return publicRoutePatterns.some((regex) => regex.test(path));
};
