// Slack API TypeScript types based on @slack/web-api
// These types are derived from the official Slack Web API SDK

interface WebAPICallResult {
  ok?: boolean;
  error?: string;
  needed?: string;
  provided?: string;
  warning?: string;
}

// OAuth v2 Access Response
export interface OauthV2AccessResponse extends WebAPICallResult {
  access_token?: string;
  app_id?: string;
  authed_user?: AuthedUser;
  bot_user_id?: string;
  enterprise?: Enterprise;
  expires_in?: number;
  incoming_webhook?: IncomingWebhook;
  is_enterprise_install?: boolean;
  refresh_token?: string;
  scope?: string;
  team?: Enterprise;
  token_type?: string;
}

interface AuthedUser {
  access_token?: string;
  expires_in?: number;
  id?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface Enterprise {
  id?: string;
  name?: string;
}

interface IncomingWebhook {
  channel?: string;
  channel_id?: string;
  configuration_url?: string;
  url?: string;
}

// Conversations List Response
export interface ConversationsListResponse extends WebAPICallResult {
  channels?: Channel[];
  response_metadata?: ResponseMetadata;
}

export interface Channel {
  context_team_id?: string;
  conversation_host_id?: string;
  created?: number;
  creator?: string;
  id?: string;
  internal_team_ids?: string[];
  is_archived?: boolean;
  is_channel?: boolean;
  is_ext_shared?: boolean;
  is_general?: boolean;
  is_global_shared?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_member?: boolean;
  is_moved?: number;
  is_mpim?: boolean;
  is_org_default?: boolean;
  is_org_mandatory?: boolean;
  is_org_shared?: boolean;
  is_pending_ext_shared?: boolean;
  is_private?: boolean;
  is_shared?: boolean;
  is_user_deleted?: boolean;
  name?: string;
  name_normalized?: string;
  num_members?: number;
  pending_connected_team_ids?: string[];
  pending_shared?: string[];
  previous_names?: string[];
  priority?: number;
  properties?: Properties;
  purpose?: Purpose;
  shared_team_ids?: string[];
  topic?: Purpose;
  unlinked?: number;
  updated?: number;
  user?: string;
}

interface Properties {
  canvas?: Canvas;
  posting_restricted_to?: RestrictedTo;
  tabs?: Tab[];
  tabz?: Tab[];
  threads_restricted_to?: RestrictedTo;
}

interface Canvas {
  file_id?: string;
  is_empty?: boolean;
  quip_thread_id?: string;
}

interface RestrictedTo {
  type?: string[];
  user?: string[];
}

interface Tab {
  id?: string;
  label?: string;
  type?: string;
}

interface Purpose {
  creator?: string;
  last_set?: number;
  value?: string;
}

interface ResponseMetadata {
  next_cursor?: string;
}

// Auth Test Response
export interface AuthTestResponse extends WebAPICallResult {
  app_id?: string;
  app_name?: string;
  bot_id?: string;
  enterprise_id?: string;
  expires_in?: number;
  is_enterprise_install?: boolean;
  team?: string;
  team_id?: string;
  url?: string;
  user?: string;
  user_id?: string;
}

// Chat Post Message Response
export interface ChatPostMessageResponse extends WebAPICallResult {
  channel?: string;
  deprecated_argument?: string;
  errors?: string[];
  message?: ChatPostMessageResponseMessage;
  response_metadata?: ResponseMetadata;
  ts?: string;
}

interface ChatPostMessageResponseMessage {
  app_id?: string;
  attachments?: unknown[];
  blocks?: unknown[];
  bot_id?: string;
  bot_profile?: unknown;
  icons?: unknown;
  metadata?: unknown;
  parent_user_id?: string;
  room?: unknown;
  root?: unknown;
  subtype?: string;
  team?: string;
  text?: string;
  thread_ts?: string;
  ts?: string;
  type?: string;
  user?: string;
  username?: string;
}

// Application-specific types
export interface SlackChannel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  memberCount?: number;
  isArchived?: boolean;
  isMember?: boolean;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope: string;
  tokenType: string;
  teamId: string;
  teamName: string;
  userId: string;
}

export interface SlackUserInfo {
  id: string;
  name: string;
  email?: string;
  teamId: string;
  teamName: string;
}
