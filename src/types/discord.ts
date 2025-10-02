// Discord API response types based on official Discord API documentation

// OAuth2 Token Response
// https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response
export interface DiscordOAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  // Bot installation specific fields
  guild?: {
    id: string;
    name: string;
  };
}

// OAuth2 Token Info Response
// https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information
export interface DiscordOAuth2TokenInfo {
  application: {
    id: string;
    name: string;
    icon?: string;
    description: string;
    bot_public: boolean;
    bot_require_code_grant: boolean;
  };
  scopes: string[];
  expires: string;
  user?: DiscordUser;
}

// User Object
// https://discord.com/developers/docs/resources/user#user-object
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  } | null;
}

// Guild Object
// https://discord.com/developers/docs/resources/guild#guild-object
export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string | null;
  icon_hash?: string | null;
  splash?: string | null;
  discovery_splash?: string | null;
  owner?: boolean;
  owner_id: string;
  permissions?: string;
  region?: string | null;
  afk_channel_id?: string | null;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: string | null;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: DiscordRole[];
  emojis: DiscordEmoji[];
  features: string[];
  mfa_level: number;
  application_id?: string | null;
  system_channel_id?: string | null;
  system_channel_flags: number;
  rules_channel_id?: string | null;
  max_presences?: number | null;
  max_members?: number;
  vanity_url_code?: string | null;
  description?: string | null;
  banner?: string | null;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id?: string | null;
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: DiscordWelcomeScreen;
  nsfw_level: number;
  stickers?: DiscordSticker[];
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id?: string | null;
}

// Channel Object
// https://discord.com/developers/docs/resources/channel#channel-object
export interface DiscordChannel {
  id: string;
  type: DiscordChannelType;
  guild_id?: string;
  position?: number;
  permission_overwrites?: DiscordOverwrite[];
  name?: string;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string | null;
  owner_id?: string;
  application_id?: string;
  managed?: boolean;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: DiscordThreadMetadata;
  member?: DiscordThreadMember;
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number;
  total_message_sent?: number;
  available_tags?: DiscordForumTag[];
  applied_tags?: string[];
  default_reaction_emoji?: DiscordDefaultReaction | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: number | null;
  default_forum_layout?: number;
}

// Channel Types
// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
export enum DiscordChannelType {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
  GUILD_MEDIA = 16,
}

// Supporting interfaces
export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: DiscordRoleTags;
  flags: number;
}

export interface DiscordRoleTags {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
  subscription_listing_id?: string;
  available_for_purchase?: null;
  guild_connections?: null;
}

export interface DiscordEmoji {
  id?: string | null;
  name?: string | null;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface DiscordSticker {
  id: string;
  pack_id?: string;
  name: string;
  description?: string | null;
  tags: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: string;
  user?: DiscordUser;
  sort_value?: number;
}

export interface DiscordWelcomeScreen {
  description?: string | null;
  welcome_channels: DiscordWelcomeScreenChannel[];
}

export interface DiscordWelcomeScreenChannel {
  channel_id: string;
  description: string;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

export interface DiscordOverwrite {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

export interface DiscordThreadMetadata {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string | null;
}

export interface DiscordThreadMember {
  id?: string;
  user_id?: string;
  join_timestamp: string;
  flags: number;
  member?: DiscordGuildMember;
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  } | null;
}

export interface DiscordForumTag {
  id: string;
  name: string;
  moderated: boolean;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

export interface DiscordDefaultReaction {
  emoji_id?: string | null;
  emoji_name?: string | null;
}

// Message and Embed types for sending messages
export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: DiscordAllowedMentions;
  components?: DiscordComponent[];
  files?: DiscordFile[];
  flags?: number;
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordAllowedMentions {
  parse?: ("roles" | "users" | "everyone")[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface DiscordComponent {
  type: number;
  components?: DiscordComponent[];
  style?: number;
  label?: string;
  emoji?: DiscordEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface DiscordFile {
  name: string;
  data: Buffer | Uint8Array;
  description?: string;
}

// Error response type
// https://discord.com/developers/docs/reference#error-messages
export interface DiscordErrorResponse {
  code: number;
  message: string;
  errors?: DiscordValidationErrors;
}

// Discord validation error structure - can be deeply nested
export interface DiscordValidationErrors {
  [field: string]: DiscordFieldError | DiscordValidationErrors;
}

export interface DiscordFieldError {
  _errors?: Array<{
    code: string;
    message: string;
  }>;
  [nestedField: string]:
    | DiscordFieldError
    | DiscordValidationErrors
    | Array<{
        code: string;
        message: string;
      }>
    | undefined;
}
