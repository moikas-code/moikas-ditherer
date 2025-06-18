import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export default {
  packagerConfig: {
    asar: true,
    name: "MOIKA DITHERER",
    executableName: "moika-ditherer",
    // icon: "./public/icon", // Uncomment when you have proper icon files
    out: "./dist/packages",
    ignore: [
      /^\/src\//,
      /^\/tests\//,
      /^\/node_modules\/(?!(gif\.js|gifuct-js))/,
      /\.(ts|tsx)$/,
      /\.(test|spec)\./,
      /^\/\.git/,
      /^\/\.vscode/,
      /vitest\.config/,
      /vite\.config/,
    ],
  },
  rebuildConfig: {},
  makers: [
    // Windows (requires Wine and Mono on Linux/macOS)
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "moika_ditherer",
        authors: "Warren Gates",
        description: "Free app for dithering and creative FX",
        // setupIcon: "./public/icon.ico", // Uncomment when you have proper icon files
        iconUrl: "https://raw.githubusercontent.com/warrengates/moi-dither/main/public/icon.ico",
        loadingGif: "./public/loading.gif",
      },
    },
    // macOS
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        name: "MOIKA DITHERER",
        // icon: "./public/icon.icns", // Uncomment when you have proper icon files
        // background: "./public/dmg-background.png", // Uncomment when you have proper background image
        format: "ULFO",
      },
    },
    // Linux
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"],
      config: {
        options: {
          maintainer: "Warren Gates",
          homepage: "https://github.com/warrengates/moi-dither",
          description: "Free app for dithering and creative FX",
          categories: ["Graphics", "Photography"],
          // icon: "./public/icon.png", // Uncomment when you have proper icon files
          bin: "moika-ditherer",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      platforms: ["linux"],
      config: {
        options: {
          homepage: "https://github.com/warrengates/moi-dither",
          description: "Free app for dithering and creative FX",
          categories: ["Graphics", "Photography"],
          // icon: "./public/icon.png", // Uncomment when you have proper icon files
          bin: "moika-ditherer",
        },
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "moikas-code",
          name: "moikas-ditherer"
        },
        prerelease: false,
        draft: false
      }
    }
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};