const DEFAULT_LOCAL_SITE_URL = "http://127.0.0.1:3211";

export function getAuthRedirectUrl() {
  return (
    process.env.EXPO_PUBLIC_CONVEX_SITE_URL ??
    process.env.EXPO_PUBLIC_SITE_URL ??
    DEFAULT_LOCAL_SITE_URL
  ).replace(/\/$/, "");
}
