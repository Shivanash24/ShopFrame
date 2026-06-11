import{j as e}from"./jsx-runtime-0DLF9kdB.js";import{b as f}from"./index-m-PWGZFs.js";import{l as j,m as w,_ as S,k as g,M as l,a as h,S as d}from"./components-DzahJWFO.js";import{w as k,x as v,O as b,C as M}from"./index-BZ71qoej.js";import{d as a}from"./index-BzeT1_pO.js";/**
 * @remix-run/react v2.16.7
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let c="positions";function O({getKey:t,...r}){let{isSpaMode:p}=j(),n=k(),m=v();w({getKey:t,storageKey:c});let u=a.useMemo(()=>{if(!t)return null;let s=t(n,m);return s!==n.key?s:null},[]);if(p)return null;let x=((s,y)=>{if(!window.history.state||!window.history.state.key){let o=Math.random().toString(32).slice(2);window.history.replaceState({key:o},"")}try{let i=JSON.parse(sessionStorage.getItem(s)||"{}")[y||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(o){console.error(o),sessionStorage.removeItem(s)}}).toString();return a.createElement("script",S({},r,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${x})(${JSON.stringify(c)}, ${JSON.stringify(u)})`}}))}function C(){const t=g(),r=(t==null?void 0:t.apiKey)||"";return e.jsxs("html",{children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),e.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),e.jsx("link",{rel:"stylesheet",href:"https://cdn.shopify.com/static/fonts/inter/v4/styles.css"}),r&&e.jsx("meta",{name:"shopify-api-key",content:r}),e.jsx("script",{src:"https://cdn.shopify.com/shopifycloud/app-bridge.js"}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
              // Basic check to see if the source is reachable and handle tunnel drops gracefully
              setInterval(() => {
                fetch(window.location.origin + '/health', { mode: 'no-cors' })
                  .catch(() => console.error("Cloudflare tunnel is offline. Fix the tunnel to prevent chrome-error origin mismatches."));
              }, 30000); // Check every 30 seconds
            `}}),e.jsx(l,{}),e.jsx(h,{})]}),e.jsxs("body",{children:[e.jsx(b,{}),e.jsx(O,{}),e.jsx(d,{})]})]})}function H(){const t=M();return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx("title",{children:"Oh no!"}),e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),e.jsx("script",{src:"https://cdn.shopify.com/shopifycloud/app-bridge.js"}),e.jsx(l,{}),e.jsx(h,{})]}),e.jsxs("body",{children:[e.jsx("div",{style:{padding:"20px"},children:f.error(t)}),e.jsx(d,{})]})]})}export{H as ErrorBoundary,C as default};
