import { ComponentChildren } from "preact";
import { Suspense } from "preact/compat";

interface LazySectionProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
}

const DefaultFallback = () => (
  <div
    style={{
      height: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6b7280",
    }}
  >
    Loading...
  </div>
);

export default function LazySection({
  children,
  fallback = <DefaultFallback />,
}: LazySectionProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
