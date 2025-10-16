import prerender, { locationStub } from "preact-iso/prerender";

import App from "./App";

export async function SSRRender(url: string = "/") {
  // Set up location stub for SSR
  locationStub(url);

  const { html, links } = await prerender(<App />);

  // Filter out non-HTTP links (mailto:, tel:, etc.) but keep internal routes for preloading
  const linkArray = links
    ? Array.from(links).filter(
        (link: string) =>
          link.startsWith("/") ||
          link.startsWith("http://") ||
          link.startsWith("https://")
      )
    : [];

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
    
    <!-- Preload critical resources for LCP -->
    <link rel="preload" as="image" href="/images/landing/slack-case.webp" media="(min-width: 769px)" fetchpriority="high" />
    <link rel="preload" as="image" href="/images/landing/slack-case-mobile.webp" media="(max-width: 768px)" fetchpriority="high" />    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//clerk.com" />
    <link rel="dns-prefetch" href="//tawk.to" />
    
    <link href="/assets/main.css" rel="stylesheet" />
    ${linkArray
      .map((link: string) => `<link rel="prefetch" href="${link}" />`)
      .join("\n    ")}
  </head>
  <body>
    ${html}
    <script type="module" src="/assets/main.js"></script>
    <!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/68e4e180256862194d540047/1j6v11nks';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->
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
