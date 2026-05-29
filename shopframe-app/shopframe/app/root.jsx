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
                // ─── Iframe escape: break out of chrome-error:// or unknown origins ───
                // When Shopify loads this embedded app, it is inside an iframe whose
                // parent is admin.shopify.com. If the tunnel is down or the page fails
                // to load, Chrome shows chrome-error://chromewebdata/ as the parent,
                // which triggers a cross-origin block on any subsequent navigation.
                // This snippet detects that state and performs a full top-level redirect
                // to the auth entry-point so the user gets a proper login/install flow.
                try {
                  if (window.top !== window.self) {
                    // Try to access the parent href — will throw if cross-origin
                    var parentHref = window.top.location.href;
                  }
                } catch (e) {
                  // Cross-origin parent detected (e.g. chrome-error://)
                  // Redirect the top frame to the Shopify app auth URL.
                  var authUrl = '/auth/login' + window.location.search;
                  window.top.location.href = authUrl;
                }

                // ─── Patch 'unload' event → 'pagehide' for Shopify App Bridge ────────
                // App Bridge registers 'unload' listeners which are deprecated in
                // modern browsers and cause console warnings. Patch them globally.
                var _origETP = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, listener, opts) {
                  return _origETP.call(this, type === 'unload' ? 'pagehide' : type, listener, opts);
                };
                var _origWin = window.addEventListener;
                window.addEventListener = function(type, listener, opts) {
                  return _origWin.call(this, type === 'unload' ? 'pagehide' : type, listener, opts);
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
