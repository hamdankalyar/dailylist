// Run: node scripts/check-notification-permissions.cjs
/* global __dirname */
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { transpileModule, ModuleKind, JsxEmit } = require("typescript");

function load(path, modules, console = globalThis.console) {
  const context = {
    exports: {},
    require: typeof modules === "function" ? modules : (name) => modules[name],
    console,
    process: { env: {} },
  };
  runInNewContext(
    transpileModule(readFileSync(resolve(__dirname, path), "utf8"), {
      compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX },
    }).outputText,
    context,
  );
  return context.exports;
}

async function check() {
  for (const os of ["ios", "android", "web"]) {
    for (const isDevice of [false, true]) {
      for (const initialStatus of ["undetermined", "granted", "denied"]) {
        for (const response of ["granted", "denied"]) {
          let status = initialStatus;
          const calls = [];
          const { registerForPushNotificationsAsync: register } = load(
            "../utils/registerForPushNotificationsAsync.ts",
            {
              "expo-device": { isDevice },
              "react-native": { Platform: { OS: os } },
              "expo-notifications/build/NotificationChannelManager.types": {
                AndroidImportance: { DEFAULT: 3 },
              },
              "expo-notifications/build/setNotificationChannelAsync": {
                setNotificationChannelAsync: async (id, channel) => {
                  assert.equal(id, "default");
                  assert.equal(channel.name, "Default");
                  assert.equal(channel.importance, 3);
                  calls.push("channel");
                },
              },
              "expo-notifications/build/NotificationPermissions": {
                getPermissionsAsync: async () => {
                  calls.push("check");
                  return { status };
                },
                requestPermissionsAsync: async () => {
                  calls.push("request");
                  status = response;
                  return { status };
                },
              },
            },
          );
          const supported = isDevice && os !== "web";
          const expected = initialStatus === "undetermined" ? response : status;
          assert.equal(await register(), supported ? expected : null);
          assert.deepEqual(
            calls,
            supported
              ? [
                  ...(os === "android" ? ["channel"] : []),
                  "check",
                  ...(initialStatus === "undetermined" ? ["request"] : []),
                ]
              : [],
            "Android creates its channel before permission calls",
          );
          calls.length = 0;
          assert.equal(await register(), supported ? expected : null);
          assert.ok(!calls.includes("request"), "repeat checks do not prompt");
        }
      }
    }
  }

  // Evaluate the installed package's real modules with Android Expo Go native stubs.
  const nativeCalls = [];
  const nativeModule = {
    getRegistrationInfoAsync: async () => null,
    getPermissionsAsync: async () => {
      nativeCalls.push("check");
      return { status: "undetermined" };
    },
    requestPermissionsAsync: async () => {
      nativeCalls.push("request");
      return { status: "granted" };
    },
    setNotificationChannelAsync: async () => nativeCalls.push("channel"),
  };
  const nativeMocks = {
    expo: { isRunningInExpoGo: () => true },
    "expo-modules-core": {
      Platform: { OS: "android" },
      requireNativeModule: () => nativeModule,
    },
    "expo-application": {},
    "expo-constants": {},
    "abort-controller/polyfill": {},
  };
  function loadInstalled(path) {
    const modulePath = path.replace(/\.js$/, "");
    path = [".android.js", ".native.js", ".js"]
      .map((suffix) => modulePath + suffix)
      .find(existsSync);
    return load(
      path,
      (name) => {
        if (!name.startsWith(".")) {
          assert.ok(name in nativeMocks, `native stub exists for ${name}`);
          return nativeMocks[name];
        }
        const base = resolve(dirname(path), name);
        const file = [".android.js", ".native.js", ".js"]
          .map((suffix) => base + suffix)
          .find(existsSync);
        assert.ok(file, `installed module exists for ${name}`);
        return loadInstalled(file);
      },
      { warn: () => {} },
    );
  }
  const notificationsRoot = dirname(
    require.resolve("expo-notifications/package.json"),
  );
  assert.throws(
    () => loadInstalled(resolve(notificationsRoot, "build/index.js")),
    /removed from Expo Go/,
    "the installed package's main entry reproduces the reported import error",
  );
  const { registerForPushNotificationsAsync: registerInExpoGo } = load(
    "../utils/registerForPushNotificationsAsync.ts",
    (name) => {
      if (name === "expo-device") return { isDevice: true };
      if (name === "react-native") return { Platform: { OS: "android" } };
      assert.ok(name.startsWith("expo-notifications/build/"));
      return loadInstalled(
        resolve(
          notificationsRoot,
          name.replace("expo-notifications/", "") + ".js",
        ),
      );
    },
  );
  assert.equal(await registerInExpoGo(), "granted");
  assert.deepEqual(nativeCalls, ["channel", "check", "request"]);

  const logs = [];
  const errors = [];
  let requestCalls = 0;
  let failure;
  const element = (type, props) => ({ type, props });
  const screen = load(
    "../app/counter/index.tsx",
    {
      "react/jsx-runtime": { jsx: element, jsxs: element },
      "react-native": {
        View: "View",
        Text: "Text",
        TouchableOpacity: "TouchableOpacity",
        StyleSheet: { create: (styles) => styles },
      },
      "../../theme": { theme: { color: { black: "#000", white: "#fff" } } },
      "../../utils/registerForPushNotificationsAsync": {
        registerForPushNotificationsAsync: async () => {
          requestCalls++;
          if (failure) throw failure;
          return "granted";
        },
      },
    },
    { log: (value) => logs.push(value), error: (...args) => errors.push(args) },
  ).default();
  assert.equal(requestCalls, 0, "rendering does not request permission");
  const button = screen.props.children.find(
    (child) => child.type === "TouchableOpacity",
  );
  assert.equal(button.props.children.props.children, "Request permission");
  assert.equal(button.props.accessibilityRole, "button");
  await button.props.onPress();
  assert.deepEqual(logs, ["granted"], "a press logs the permission result");
  failure = new Error("Native permission request failed");
  await button.props.onPress();
  assert.equal(errors[0][1], failure, "the handler catches native errors");
  console.log("Notification permission utility and button checks pass.");
}

check().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
