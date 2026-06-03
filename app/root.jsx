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

                // ─── Graceful WebSocket Error Handling (Vite HMR & CLI Extensions) ───
                // Cloudflare tunnels frequently drop idle WebSocket connections, causing
                // noisy console errors from Vite or Shopify Dev Console. This intercepts
                // and handles them gracefully.
                var _origWebSocket = window.WebSocket;
                window.WebSocket = function(url, protocols) {
                  var ws = protocols ? new _origWebSocket(url, protocols) : new _origWebSocket(url);
                  
                  // Add specific checks for the connection state
                  ws.addEventListener("open", function() {
                    if (url.includes('extensions') || url.includes('hmr')) {
                      console.log("[Dev] WebSocket connected gracefully to: " + url);
                    }
                  });

                  ws.addEventListener("close", function(event) {
                    if (url.includes('extensions') || url.includes('hmr')) {
                      console.warn("[Dev] WebSocket closed gracefully. Tunnel may be idle.");
                    }
                  });

                  ws.addEventListener("error", function(err) {
                    if (url.includes('extensions') || url.includes('trycloudflare.com')) {
                      console.warn("[Dev] WebSocket connection failed. If the tunnel is active, this will automatically retry.");
                      // Prevent the unhandled error from blowing up the console if possible
                      err.preventDefault && err.preventDefault();
                    }
                  });

                  return ws;
                };
                window.WebSocket.prototype = _origWebSocket.prototype;
                window.WebSocket.CONNECTING = _origWebSocket.CONNECTING;
                window.WebSocket.OPEN = _origWebSocket.OPEN;
                window.WebSocket.CLOSING = _origWebSocket.CLOSING;
                window.WebSocket.CLOSED = _origWebSocket.CLOSED;
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
