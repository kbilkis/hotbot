import * as modalStyles from "@/styles/providers/modal.css";

import DiscordGuildList from "./DiscordGuildList";

interface DiscordChannelSectionProps {
  isConnected: boolean;
  username?: string;
}

export default function DiscordChannelSection({
  isConnected,
  username,
}: Readonly<DiscordChannelSectionProps>) {
  if (!isConnected) {
    return null;
  }

  return (
    <>
      {username && (
        <div className={modalStyles.formGroup}>
          <div className={modalStyles.providerDisplay}>
            <span className={modalStyles.connectionStatusConnected}>
              ✓ Connected
            </span>
            <span className={modalStyles.teamName}>as {username}</span>
          </div>
        </div>
      )}

      <DiscordGuildList />
    </>
  );
}
