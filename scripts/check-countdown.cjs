// Run: node scripts/check-countdown.cjs
/* global __dirname */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { transpileModule, ModuleKind, JsxEmit } = require("typescript");
const dates = require("date-fns");
const tick = () => new Promise(setImmediate);
let now = new Date(2026, 9, 3, 12).getTime();
let saved = null;
let width = 375;
let permission = "granted";
let schedulingError;
let notificationId = 0;
const scheduled = new Map();
const events = [];
const intervals = new Map();
let intervalId = 0;
const storage = {
  getFromStorage: async () => saved,
  saveToStorage: async (key, value) => {
    assert.equal(key, countdown.countdownStorageKey);
    saved = JSON.parse(JSON.stringify(value));
  },
};

function load(path, modules, globals = {}) {
  const context = {
    exports: {},
    require: (name) => {
      assert.ok(name in modules, `module mock exists: ${name}`);
      return modules[name];
    },
    console: { error: () => {} },
    Date: { now: () => now },
    ...globals,
  };
  runInNewContext(
    transpileModule(readFileSync(resolve(__dirname, path), "utf8"), {
      compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX },
    }).outputText,
    context,
  );
  return context.exports;
}

const countdown = load("../utils/countdown.ts", {
  "date-fns": dates,
  "./storage": storage,
});
const theme = load("../theme.ts", {}).theme;

// A small hook runner executes the screen's real effects and cleanup functions.
function createScreen(path) {
  const slots = [];
  let cursor;
  let effects;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { value: initial };
      return [slots[index].value, (value) => (slots[index].value = value)];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { value: { current: initial } };
      return slots[index].value;
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (
        !slots[index] ||
        dependencies.some((value, i) => !Object.is(value, slots[index].deps[i]))
      ) {
        effects.push(() => {
          slots[index]?.cleanup?.();
          slots[index] = { deps: dependencies, cleanup: effect() };
        });
      }
    },
  };
  const element = (type, props) => ({ type, props });
  const native = {
    View: "View",
    Text: "Text",
    TouchableOpacity: "TouchableOpacity",
    ActivityIndicator: "ActivityIndicator",
    FlatList: "FlatList",
    StyleSheet: { create: (styles) => styles },
    Alert: { alert: () => events.push("alert") },
    useWindowDimensions: () => ({ width }),
  };
  const screen = load(
    path,
    {
      react,
      "react/jsx-runtime": { jsx: element, jsxs: element },
      "react-native": native,
      "date-fns": dates,
      "expo-device": { isDevice: true },
      "expo-haptics": {
        NotificationFeedbackType: { Success: "success" },
        notificationAsync: async (type) => events.push(type),
      },
      "react-native-confetti-cannon": { __esModule: true, default: "Confetti" },
      "../../components/TimerSegment": { TimerSegment: "TimerSegment" },
      "../../theme": { theme },
      "../../utils/countdown": countdown,
      "../../utils/storage": storage,
      "../../utils/registerForPushNotificationsAsync": {
        registerForPushNotificationsAsync: async () => permission,
      },
      "expo-notifications/build/Notifications.types": {
        SchedulableTriggerInputTypes: { TIME_INTERVAL: "timeInterval" },
      },
      "expo-notifications/build/cancelScheduledNotificationAsync": {
        cancelScheduledNotificationAsync: async (id) => {
          events.push(["cancel", id]);
          scheduled.delete(id);
        },
      },
      "expo-notifications/build/scheduleNotificationAsync": {
        scheduleNotificationAsync: async (request) => {
          if (schedulingError) throw schedulingError;
          const id = `notification-${++notificationId}`;
          scheduled.set(id, request);
          return id;
        },
      },
    },
    {
      setInterval: (callback, delay) => {
        assert.equal(delay, 1000);
        intervals.set(++intervalId, callback);
        return intervalId;
      },
      clearInterval: (id) => intervals.delete(id),
    },
  ).default;
  return {
    render() {
      cursor = 0;
      effects = [];
      const tree = screen();
      const confetti = tree.props.children?.find?.(
        (child) => child.type === "Confetti",
      );
      if (confetti)
        confetti.props.ref.current = { start: () => events.push("confetti") };
      for (const effect of effects) effect();
      return tree;
    },
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
    },
  };
}

async function ready(screen) {
  screen.render();
  await tick();
  screen.render();
  return screen.render();
}
const button = (tree) =>
  tree.props.children.find((child) => child.type === "TouchableOpacity");

async function check() {
  for (const invalid of [null, {}, { completedAtTimestamps: ["bad"] }]) {
    saved = invalid;
    assert.equal(
      (await countdown.loadCountdownState()).completedAtTimestamps.length,
      0,
    );
  }
  saved = null;
  const screen = createScreen("../app/counter/index.tsx");
  const initial = screen.render();
  assert.equal(initial.props.children.type, "ActivityIndicator");
  assert.equal(intervals.size, 0, "storage loading does not start an interval");
  let tree = await ready(screen);
  assert.equal(tree.props.children[0].props.children, "Car wash due in");
  assert.equal(intervals.size, 1, "a fresh install finishes loading");
  assert.equal(
    events.length,
    0,
    "opening the screen does not trigger feedback",
  );
  assert.ok(
    tree.props.children[1].props.children.every(
      (segment) => segment.props.number === 0,
    ),
  );
  const confetti = tree.props.children.at(-1);
  assert.equal(confetti.props.autoStart, false);
  assert.equal(confetti.props.fadeOut, true);
  assert.equal(confetti.props.count, 50);
  assert.equal(confetti.props.origin.x, width / 2);
  width = 800;
  assert.equal(screen.render().props.children.at(-1).props.origin.x, 400);

  await button(tree).props.onPress();
  tree = screen.render();
  tree = screen.render();
  assert.equal(saved.completedAtTimestamps[0], now);
  assert.deepEqual(events, ["success", "confetti"]);
  assert.equal(scheduled.size, 1);
  assert.equal(
    scheduled.get(saved.currentNotificationId).trigger.seconds,
    countdown.frequency / 1000,
  );
  assert.equal(tree.props.children[1].props.children[0].props.number, 14);
  assert.equal(intervals.size, 1, "a completion replaces the interval");

  const oldId = saved.currentNotificationId;
  now += 1000;
  await button(tree).props.onPress();
  screen.render();
  tree = screen.render();
  assert.ok(events.some((event) => Array.isArray(event) && event[1] === oldId));
  assert.equal(
    scheduled.size,
    1,
    "early completion cancels the previous reminder",
  );
  assert.equal(saved.completedAtTimestamps.length, 2);
  assert.ok(saved.completedAtTimestamps[0] > saved.completedAtTimestamps[1]);

  const deadline = saved.completedAtTimestamps[0] + countdown.frequency;
  assert.equal(
    countdown.getCountdownStatus(deadline, deadline).isOverdue,
    false,
  );
  now = deadline + 5000;
  for (const callback of intervals.values()) callback();
  tree = screen.render();
  assert.equal(tree.props.children[0].props.children, "Car wash overdue by");
  assert.equal(tree.props.style[1].backgroundColor, theme.color.red);
  assert.equal(tree.props.children[1].props.children[3].props.number, 5);
  assert.equal(
    tree.props.children[1].props.children[3].props.textStyle.color,
    theme.color.white,
  );
  screen.unmount();
  assert.equal(intervals.size, 0, "unmounting clears the interval");

  const reopened = createScreen("../app/counter/index.tsx");
  tree = await ready(reopened);
  assert.equal(
    tree.props.children[0].props.children,
    "Car wash overdue by",
    "overdue status survives reopening",
  );
  permission = "denied";
  await button(tree).props.onPress();
  reopened.render();
  tree = reopened.render();
  assert.equal(scheduled.size, 0);
  assert.equal(
    saved.completedAtTimestamps.length,
    3,
    "permission denial still records completion",
  );
  assert.equal(tree.props.children[0].props.children, "Car wash due in");
  assert.ok(events.includes("alert"));
  permission = "granted";
  schedulingError = new Error("Scheduling failed");
  await button(tree).props.onPress();
  assert.equal(
    saved.completedAtTimestamps.length,
    4,
    "scheduling failure still records completion",
  );
  reopened.unmount();

  const history = createScreen("../app/counter/history.tsx");
  const list = await ready(history);
  assert.equal(list.type, "FlatList");
  assert.equal(list.props.data.length, 4);
  const item = list.props.renderItem({ item: list.props.data[0] });
  assert.equal(item.props.children.props.children, dates.format(now, "PPpp"));
  history.unmount();
  saved = null;
  const emptyHistory = createScreen("../app/counter/history.tsx");
  const emptyList = await ready(emptyHistory);
  assert.equal(emptyList.props.data.length, 0);
  assert.equal(
    emptyList.props.ListEmptyComponent.props.children.props.children,
    "No history",
  );
  emptyHistory.unmount();
  assert.equal(intervals.size, 0);
  console.log(
    "Countdown loading, persistence, intervals, cancellation, feedback, and history checks pass.",
  );
}

check().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
