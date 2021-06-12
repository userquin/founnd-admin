Just clone the repo and run `yarn install`

Locate `node_modules/vite-plugin-pwa/dist/index.js` inside the project, open it 
and replace the content with `src/vite-plugin-pwa.js` content.

Finally, run `yarn build && yarn serve`.

This fork includes:
- [vue-router-next](https://next.router.vuejs.org), 
- [web worker with vite worker plugin](https://vitejs.dev/guide/features.html#web-workers), 
- generate `sw manifest assets` (including `robots.txt`, there is an issue from `vitesse`, `favicon.svg` and `sw` 
  manifest icons to work offline). 
  
`VitePWA` plugin has been configured using `registerType: 'autoUpdate'` using `@rollup/plugin-replace` plugin
to allow change `sw` between builds. The application is using `@vueuse/useTimeAgo` to show the time from the build date.
