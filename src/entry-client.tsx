import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";

import App from "./App";

function Client() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// For development with Vite, use createRoot
// For production SSR, this will be replaced with hydrateRoot
const container = document.getElementById("root");
if (container) {
  if (import.meta.env.DEV) {
    // Development mode - create new root
    ReactDOM.createRoot(container).render(<Client />);
  } else {
    // Production mode - hydrate existing SSR content
    ReactDOM.hydrateRoot(container, <Client />);
  }
}
