import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Patch EventTarget prototype for generic DOM elements
                var originalAddEventListener = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, listener, options) {
                  if (type === 'unload') {
                    type = 'pagehide';
                  }
                  return originalAddEventListener.call(this, type, listener, options);
                };
                
                // Patch window directly in case scripts cache the reference
                var originalWindowAddEventListener = window.addEventListener;
                window.addEventListener = function(type, listener, options) {
                  if (type === 'unload') {
                    type = 'pagehide';
                  }
                  return originalWindowAddEventListener.call(this, type, listener, options);
                };
              })();
            `,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
