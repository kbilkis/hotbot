// Shared provider brand colors utility

export const getProviderColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "github":
      return "#001C4D";
    case "gitlab":
      return "#E24328";
    case "bitbucket":
      return "#0052cc";
    case "slack":
      return "#4a154b";
    case "discord":
      return "#5865f2";
    case "teams":
      return "#6264a7";
    default:
      return "#6b7280";
  }
};

export const getProviderBgColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "github":
      return "#f6f8fa";
    case "gitlab":
      return "#fdf2ec";
    case "bitbucket":
      return "#e6f3ff";
    case "slack":
      return "#f4e8f7";
    case "discord":
      return "#E0E3FF";
    case "teams":
      return "#f0f0f8";
    default:
      return "#f9fafb";
  }
};

export const getProviderAccentColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "github":
      return "#0969da";
    case "gitlab":
      return "#FDA326";
    case "bitbucket":
      return "#0747a6";
    case "slack":
      return "#611f69";
    case "discord":
      return "#4752c4";
    case "teams":
      return "#464775";
    default:
      return "#4f46e5";
  }
};
