import { hydrate } from "preact-iso";

import "./index.css";

import App from "./App";

// Hydrate the app for both dev and production
hydrate(<App />);
