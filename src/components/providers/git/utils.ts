import { githubApi, gitlabApi } from "@/lib/api/client";
import { GitProviderData } from "@/lib/validation/provider-schemas";

/**
 * Get the appropriate API client for a git provider
 */
export const getProviderApi = (provider: GitProviderData["provider"]) => {
  switch (provider) {
    case "github":
      return githubApi;
    case "gitlab":
      return gitlabApi;
    case "bitbucket":
      // TODO: Add bitbucketApi when implemented
      throw new Error("Bitbucket API not yet implemented");
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};
