"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __objSpread = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
var _path = require('path');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _workboxbuild = require('workbox-build');

// src/constants.ts
var FILE_MANIFEST = "manifest.webmanifest";
var FILE_SW_REGISTER = "registerSW.js";
var VIRTUAL_MODULES_MAP = {
  "virtual:pwa-register": "register",
  "virtual:pwa-register/vue": "vue"
};
var VIRTUAL_MODULES_RESOLVE_PREFIX = "/@vite-plugin-pwa/";
var VIRTUAL_MODULES = Object.keys(VIRTUAL_MODULES_MAP);

// src/html.ts
function generateSimpleSWRegister(options) {
  return `
if('serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker.register('${options.base + options.filename}', { scope: '${options.scope}' })
})
}`.replace(/\n/g, "");
}
function injectServiceWorker(html, options) {
  const manifest = options.manifest ? `<link rel="manifest" href="${options.base + FILE_MANIFEST}">` : "";
  if (options.injectRegister === "inline") {
    return html.replace("</head>", `${manifest}<script>${generateSimpleSWRegister(options)}</script></head>`);
  }
  if (options.injectRegister === "script") {
    return html.replace("</head>", `${manifest}<script src="${options.base + FILE_SW_REGISTER}"></script></head>`);
  }
  return html.replace("</head>", `${manifest}</head>`);
}

// src/modules.ts



async function generateRegisterSW(options, mode, source = "register") {
  const sw = options.base + options.filename;
  const scope = options.scope;
  const content = await _fs.promises.readFile(_path.resolve.call(void 0, __dirname, `client/${mode}/${source}.mjs`), "utf-8");
  return content.replace("__SW__", sw).replace("__SCOPE__", scope).replace("__SW_AUTO_UPDATE__", `${options.registerType === "autoUpdate"}`);
}
async function generateInjectManifest(options, viteOptions) {
  const rollup = require("rollup");
  const excludedPluginNames = [
    "vite-plugin-pwa",
    "vite:build-html",
    "vite:html"
  ];
  const plugins = viteOptions.plugins.filter((p) => !excludedPluginNames.includes(p.name));
  const bundle = await rollup.rollup({
    input: options.swSrc,
    plugins
  });
  try {
    await bundle.write({
      format: "cjs",
      exports: "none",
      inlineDynamicImports: true,
      file: options.injectManifest.swDest,
      sourcemap: viteOptions.build.sourcemap
    });
  } finally {
    await bundle.close();
  }
  const injectManifestOptions = __objSpread(__objSpread({}, options.injectManifest), {
    swSrc: options.injectManifest.swDest
  });
  delete injectManifestOptions.mode;
  await _workboxbuild.injectManifest.call(void 0, injectManifestOptions);
}

// src/options.ts



// src/assets.ts


var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _fastglob = require('fast-glob'); var _fastglob2 = _interopRequireDefault(_fastglob);
function buildManifestEntry(publicDir, url) {
  return new Promise((resolve4, reject) => {
    const cHash = _crypto2.default.createHash("MD5");
    const stream = _fs2.default.createReadStream(_path.resolve.call(void 0, publicDir, url));
    stream.on("error", (err) => {
      reject(err);
    });
    stream.on("data", (chunk) => {
      cHash.update(chunk);
    });
    stream.on("end", () => {
      return resolve4({
        url,
        revision: `${cHash.digest("hex")}`
      });
    });
  });
}
function lookupAdditionalManifestEntries(useInjectManifest, injectManifest2, workbox) {
  return useInjectManifest ? injectManifest2.additionalManifestEntries || [] : workbox.additionalManifestEntries || [];
}
async function configureOutputBundle(resolvedVitePWAOptions, viteConfig, bundle) {
  const {
    strategies,
    injectManifest: injectManifest2,
    workbox
  } = resolvedVitePWAOptions;
  const useInjectManifest = strategies === "injectManifest";
  const manifestEntries = lookupAdditionalManifestEntries(useInjectManifest, injectManifest2, workbox);
  const manifestEntriesUrl = manifestEntries.map((me) => me.url);
  await Promise.all(Object.keys(bundle).map(async (fileName) => {
    if (!manifestEntriesUrl.includes(fileName)) {
      const asset = bundle[fileName];
      let cHash;
      if (asset.source)
        cHash = _crypto2.default.createHash("MD5").update(asset.source);
      else if (asset.code)
        cHash = _crypto2.default.createHash("MD5").update(asset.code);
      cHash && manifestEntries.push({
        url: fileName,
        revision: `${cHash.digest("hex")}`
      });
    }
  }));
}
async function configureStaticAssets(resolvedVitePWAOptions, viteConfig) {
  const {
    manifest,
    strategies,
    injectManifest: injectManifest2,
    workbox,
    includeAssets,
    includeManifestIcons
  } = resolvedVitePWAOptions;
  const useInjectManifest = strategies === "injectManifest";
  const {publicDir} = viteConfig;
  const globs = [];
  const manifestEntries = lookupAdditionalManifestEntries(useInjectManifest, injectManifest2, workbox);
  if (includeAssets) {
    if (Array.isArray(includeAssets))
      globs.push(...includeAssets);
    else
      globs.push(includeAssets);
  }
  if (includeManifestIcons && manifest && manifest.icons) {
    const icons = manifest.icons;
    Object.keys(icons).forEach((key) => {
      const icon = icons[key];
      globs.push(icon.src);
    });
  }
  if (globs.length > 0) {
    let assets = await _fastglob2.default.call(void 0, globs.map((g) => {
      return g.startsWith("/") ? g.substring(1) : g;
    }), {
      cwd: publicDir,
      onlyFiles: true,
      unique: true
    });
    if (manifestEntries.length > 0) {
      const included = manifestEntries.map((me) => me.url);
      assets = assets.filter((a) => !included.includes(a));
    }
    const assetsEntries = await Promise.all(assets.map((a) => {
      return buildManifestEntry(publicDir, a);
    }));
    manifestEntries.push(...assetsEntries);
  }
  if (manifest) {
    const cHash = _crypto2.default.createHash("MD5");
    cHash.update(generateWebManifestFile(resolvedVitePWAOptions));
    manifestEntries.push({
      url: FILE_MANIFEST,
      revision: `${cHash.digest("hex")}`
    });
  }
  if (manifestEntries.length > 0) {
    if (useInjectManifest)
      injectManifest2.additionalManifestEntries = manifestEntries;
    else
      workbox.additionalManifestEntries = manifestEntries;
  }
}
function generateWebManifestFile(options) {
  return `${JSON.stringify(options.manifest, null, options.minify ? 0 : 2)}
`;
}

// src/utils.ts
function resolveBathPath(base) {
  if (isAbsolute(base))
    return base;
  return !base.startsWith("/") && !base.startsWith("./") ? `/${base}` : base;
}
function isAbsolute(url) {
  return url.match(/^(?:[a-z]+:)?\/\//i);
}

// src/options.ts
function resolveSwPaths(injectManifest2, root, srcDir, outDir, filename) {
  const swSrc = _path.resolve.call(void 0, root, srcDir, filename);
  if (injectManifest2 && _path.extname.call(void 0, filename) === ".ts" && _fs2.default.existsSync(swSrc)) {
    const useFilename = `${filename.substring(0, filename.lastIndexOf("."))}.js`;
    return {
      swSrc,
      swDest: _path.resolve.call(void 0, root, outDir, useFilename),
      useFilename
    };
  }
  return {
    swSrc,
    swDest: _path.resolve.call(void 0, root, outDir, filename)
  };
}
async function resolveOptions(options, viteConfig) {
  const root = viteConfig.root;
  const pkg = _fs2.default.existsSync("package.json") ? JSON.parse(_fs2.default.readFileSync("package.json", "utf-8")) : {};
  const {
    mode = process["env"]["NODE_ENV"] || "production",
    srcDir = "public",
    outDir = viteConfig.build.outDir || "dist",
    injectRegister = "auto",
    registerType = "prompt",
    filename = "sw.js",
    strategies = "generateSW",
    minify = true,
    base = viteConfig.base,
    includeAssets = void 0,
    includeManifestIcons = true
  } = options;
  const basePath = resolveBathPath(base);
  const {swSrc, swDest, useFilename} = resolveSwPaths(strategies === "injectManifest", root, srcDir, outDir, filename);
  const outDirRoot = _path.resolve.call(void 0, root, outDir);
  const scope = options.scope || basePath;
  const defaultWorkbox = {
    swDest,
    globDirectory: outDirRoot,
    offlineGoogleAnalytics: false,
    cleanupOutdatedCaches: true,
    mode,
    navigateFallback: "index.html"
  };
  const defaultInjectManifest = {
    swSrc,
    swDest,
    globDirectory: outDirRoot,
    injectionPoint: "self.__WB_MANIFEST"
  };
  const defaultManifest = {
    name: pkg.name,
    short_name: pkg.name,
    start_url: basePath,
    display: "standalone",
    background_color: "#ffffff",
    lang: "en",
    scope
  };
  const workbox = Object.assign({}, defaultWorkbox, options.workbox || {});
  const manifest = typeof options.manifest === "boolean" && !options.manifest ? false : Object.assign({}, defaultManifest, options.manifest || {});
  const injectManifest2 = Object.assign({}, defaultInjectManifest, options.injectManifest || {});
  if ((injectRegister === "auto" || registerType == null) && registerType === "autoUpdate") {
    workbox.skipWaiting = true;
    workbox.clientsClaim = true;
  }
  const resolvedVitePWAOptions = {
    base: basePath,
    mode,
    swSrc,
    swDest,
    srcDir,
    outDir,
    injectRegister,
    registerType,
    filename: useFilename || filename,
    strategies,
    workbox,
    manifest,
    injectManifest: injectManifest2,
    scope,
    minify,
    includeAssets,
    includeManifestIcons
  };
  await configureStaticAssets(resolvedVitePWAOptions, viteConfig);
  return resolvedVitePWAOptions;
}

// src/cache.ts
var cachePreset = [
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts",
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-font-assets",
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-image-assets",
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-js-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-style-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\.(?:json|xml|csv)$/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "static-data-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60
      }
    }
  },
  {
    urlPattern: /\/api\/.*$/i,
    handler: "NetworkFirst",
    method: "GET",
    options: {
      cacheName: "apis",
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60
      },
      networkTimeoutSeconds: 10
    }
  },
  {
    urlPattern: /.*/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "others",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60
      },
      networkTimeoutSeconds: 10
    }
  }
];

// src/index.ts
function VitePWA(userOptions = {}) {
  let viteConfig;
  let options;
  let useImportRegister = false;
  return [
    {
      name: "vite-plugin-pwa",
      enforce: "post",
      apply: "build",
      async configResolved(config) {
        viteConfig = config;
        options = await resolveOptions(userOptions, viteConfig);
      },
      transformIndexHtml: {
        enforce: "post",
        transform(html) {
          return injectServiceWorker(html, options);
        }
      },
      async generateBundle(_, bundle) {
        if (options.manifest) {
          bundle[FILE_MANIFEST] = {
            isAsset: true,
            type: "asset",
            name: void 0,
            source: generateWebManifestFile(options),
            fileName: FILE_MANIFEST
          };
        }
        if (options.injectRegister === "auto")
          options.injectRegister = useImportRegister ? null : "script";
        if (options.injectRegister === "script" && !_fs.existsSync.call(void 0, _path.resolve.call(void 0, viteConfig.publicDir, FILE_SW_REGISTER))) {
          bundle[FILE_SW_REGISTER] = {
            isAsset: true,
            type: "asset",
            name: void 0,
            source: generateSimpleSWRegister(options),
            fileName: FILE_SW_REGISTER
          };
        }
        if (!viteConfig.build.ssr) {
          await configureOutputBundle(options, viteConfig, bundle);
          if (options.strategies === "injectManifest")
            await generateInjectManifest(options, viteConfig);
          else
            await _workboxbuild.generateSW.call(void 0, options.workbox);
        }
      }
    },
    {
      name: "vite-plugin-pwa:virtual",
      async configResolved(config) {
        viteConfig = config;
        options = await resolveOptions(userOptions, viteConfig);
      },
      resolveId(id) {
        return VIRTUAL_MODULES.includes(id) ? VIRTUAL_MODULES_RESOLVE_PREFIX + id : void 0;
      },
      load(id) {
        if (id.startsWith(VIRTUAL_MODULES_RESOLVE_PREFIX))
          id = id.slice(VIRTUAL_MODULES_RESOLVE_PREFIX.length);
        else
          return;
        if (VIRTUAL_MODULES.includes(id)) {
          useImportRegister = true;
          return generateRegisterSW(options, viteConfig.command === "build" ? "build" : "dev", VIRTUAL_MODULES_MAP[id]);
        }
      }
    }
  ];
}



exports.VitePWA = VitePWA; exports.cachePreset = cachePreset;
