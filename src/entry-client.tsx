import { hydrate } from "preact-iso";

import "./styles/base/index.css";

import App from "./App";

// Hydrate the app for both dev and production
hydrate(<App />);
