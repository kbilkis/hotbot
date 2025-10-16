import { style, globalStyle } from "@vanilla-extract/css";

import { tokens, badgeStyles, utils, iconStyles } from "../theme/index.css";

// Channel Management (Slack/Discord)
export const channelsContainer = style({
  maxHeight: "300px",
  overflowY: "auto",
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[2],
});

export const channelsContainerScrollable = style([
  channelsContainer,
  {
    selectors: {
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: tokens.colors.gray100,
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: tokens.colors.gray300,
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: tokens.colors.gray400,
      },
    },
  },
]);

export const channelItem = style([
  utils.flexBetween,
  {
    alignItems: "center",
    padding: tokens.space[3],
    borderRadius: tokens.borderRadius.base,
    transition: "background 0.2s",
    selectors: {
      "&:hover": {
        background: tokens.colors.gray50,
      },
    },
  },
]);

export const channelInfo = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    flex: 1,
  },
]);

export const channelIcon = style([
  iconStyles.base,
  {
    color: tokens.colors.textMuted,
  },
]);

export const channelName = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.gray700,
  fontWeight: tokens.fontWeight.medium,
});

export const channelDescription = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textLight,
  marginTop: tokens.space[1],
});

export const channelActions = style([utils.flex, utils.gap2]);

const testResult = style([
  badgeStyles.neutral,
  {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },
]);

export const testResultSuccess = style([
  testResult,
  {
    background: tokens.colors.successBg,
    color: tokens.colors.success,
  },
]);

export const testResultError = style([
  testResult,
  {
    background: tokens.colors.errorBg,
    color: tokens.colors.error,
  },
]);

// Guild Management (Discord)
export const guildsContainer = channelsContainer;

export const guildItem = style([
  utils.flexCol,
  {
    padding: tokens.space[4],
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.space[4],
    transition: "all 0.2s",
    selectors: {
      "&:hover": {
        borderColor: tokens.colors.gray300,
        boxShadow: tokens.boxShadow.sm,
      },
    },
  },
]);

export const guildHeader = style([
  utils.flex,
  utils.gap3,
  {
    alignItems: "center",
    marginBottom: tokens.space[3],
  },
]);

export const guildIcon = style([
  utils.flexCenter,
  {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadius.full,
    background: tokens.colors.gray100,
    fontSize: tokens.fontSize.base,
  },
]);

export const guildName = style({
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const guildChannels = style({
  paddingLeft: tokens.space[4],
});

export const guildChannelsTitle = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.gray700,
  marginBottom: tokens.space[2],
});

// Connection Method Tabs
export const connectionMethodTabs = style([
  utils.flex,
  utils.gap2,
  {
    marginBottom: tokens.space[4],
    borderBottom: `1px solid ${tokens.colors.border}`,
  },
]);

export const methodTab = style({
  padding: `${tokens.space[2]} ${tokens.space[4]}`,
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  transition: "all 0.2s",
  selectors: {
    "&:hover": {
      color: tokens.colors.gray700,
    },
  },
});

export const methodTabActive = style([
  methodTab,
  {
    color: tokens.colors.info,
    borderBottomColor: tokens.colors.info,
    fontWeight: tokens.fontWeight.medium,
  },
]);

// Webhook Section
export const webhookConnectSection = style([utils.flexCol, utils.gap4]);

export const discordSetupInfo = style({
  background: tokens.colors.gray50,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[4],
  fontSize: tokens.fontSize.sm,
});

// Child element styles using globalStyle (industry standard)
globalStyle(`${discordSetupInfo} h3`, {
  margin: `0 0 ${tokens.space[2]} 0`,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.gray700,
});

globalStyle(`${discordSetupInfo} ol`, {
  paddingLeft: tokens.space[4],
  margin: `${tokens.space[2]} 0 0 0`,
});

globalStyle(`${discordSetupInfo} li`, {
  marginBottom: tokens.space[1],
  color: tokens.colors.textMuted,
});
