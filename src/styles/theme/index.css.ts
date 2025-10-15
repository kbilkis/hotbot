// Export all theme tokens and utilities
export { tokens } from "./tokens.css";
export { utils } from "./utils.css";
export { animations } from "./animations.css";

// Export components with clear naming to avoid HTML element conflicts
export {
  button as buttonStyles,
  input as inputStyles,
  badge as badgeStyles,
  typography,
  icon as iconStyles,
  loading,
  alert as alertStyles,
} from "./components.css";

// Alternative: namespace import pattern (for advanced use cases)
export * as components from "./components.css";
