import * as ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";

import App from "./App";

export async function SSRRender(url: string = "/") {
  // Always use the built assets in production
  const bootstrapModules = ["/assets/main.js"];
  console.log(
    "SSR rendering for:",
    url,
    "with bootstrapModules:",
    bootstrapModules
  );

  const AppWithRouter = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="A git provider integration helper to various messaging providers helping developers get their Pull Requests reviewed sooner"
        />
        <title>HotBot - Code Review helper</title>
        <link href="/assets/main.css" rel="stylesheet" />
      </head>
      <body>
        <div id="root">
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </div>
      </body>
    </html>
  );

  return await ReactDOMServer.renderToReadableStream(AppWithRouter, {
    bootstrapModules,
  });
}
