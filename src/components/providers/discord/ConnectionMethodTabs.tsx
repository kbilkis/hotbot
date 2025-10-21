import * as channelStyles from "@/styles/providers/channels.css";

type ConnectionMethod = "manual" | "webhook";

interface ConnectionMethodTabsProps {
  activeMethod: ConnectionMethod;
  onMethodChange: (method: ConnectionMethod) => void;
  onError: (error: string) => void;
}

export default function ConnectionMethodTabs({
  activeMethod,
  onMethodChange,
  onError,
}: Readonly<ConnectionMethodTabsProps>) {
  const handleMethodChange = (method: ConnectionMethod) => {
    onMethodChange(method);
    onError("");
  };

  return (
    <div className={channelStyles.connectionMethodTabs}>
      <button
        className={
          activeMethod === "manual"
            ? channelStyles.methodTabActive
            : channelStyles.methodTab
        }
        onClick={() => handleMethodChange("manual")}
      >
        Bot Token
      </button>
      <button
        className={
          activeMethod === "webhook"
            ? channelStyles.methodTabActive
            : channelStyles.methodTab
        }
        onClick={() => handleMethodChange("webhook")}
      >
        Webhook URL
      </button>
    </div>
  );
}
