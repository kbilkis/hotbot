import prerender, { locationStub } from "preact-iso/prerender";

import App from "./App";

export async function SSRRender(url: string = "/") {
  // Set up location stub for SSR
  locationStub(url);

  const { html, links } = await prerender(<App />);

  // Convert Set to Array for mapping
  const linkArray = links ? Array.from(links) : [];

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="A git provider integration helper to various messaging providers helping developers get their Pull Requests reviewed sooner"
    />
    <title>HotBot - Code Review helper</title>
    <link href="/assets/main.css" rel="stylesheet" />
    ${linkArray
      .map(
        (link: string) => `<link rel="preload" href="${link}" as="script" />`
      )
      .join("\n    ")}
  </head>
  <body>
    ${html}
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>`;

  // Convert to ReadableStream for compatibility
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(fullHtml));
      controller.close();
    },
  });
}
