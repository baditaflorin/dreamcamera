export const appVersion = __APP_VERSION__;
export const appCommit = __APP_COMMIT__;
export const repoUrl = __REPO_URL__;
export const paypalUrl = __PAYPAL_URL__;
export const liveUrl = "https://baditaflorin.github.io/dreamcamera/";

export function shortCommit(commit: string): string {
  return commit.length > 12 ? commit.slice(0, 12) : commit;
}
