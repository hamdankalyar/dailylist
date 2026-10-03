// Run: node scripts/check-text-input.cjs
/* global __dirname */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { runInNewContext } = require("node:vm");

const source = readFileSync(join(__dirname, "../app/index.tsx"), "utf8");
const handler = source.match(
  /const handleSubmit = \(\) => \{[\s\S]*?\n  \};/,
)?.[0];
assert.ok(handler, "the screen defines its submission handler");

for (const value of ["", "Milk"]) {
  const shoppingList = [
    { id: "1", name: "Coffee" },
    { id: "2", name: "Tea", isCompleted: true },
    { id: "3", name: "Sugar" },
  ];
  const original = structuredClone(shoppingList);
  let updated;
  let cleared;
  let saved;

  runInNewContext(`${handler}\nhandleSubmit();`, {
    value,
    shoppingList,
    isLoading: false,
    storageKey: "shopping-list",
    saveToStorage: (key, list) => (saved = { key, list }),
    setShoppingList: (list) => (updated = list),
    setValue: (text) => (cleared = text),
  });

  assert.deepEqual(shoppingList, original, "existing items are preserved");
  assert.equal(cleared, value ? "" : undefined);
  if (value) {
    assert.equal(updated[0].name, value);
    assert.equal(new Date(updated[0].id).toISOString(), updated[0].id);
    assert.deepEqual(Array.from(updated.slice(1)), original);
    assert.equal(saved.key, "shopping-list");
    assert.equal(
      saved.list,
      updated,
      "the new array is saved rather than stale state",
    );
  } else {
    assert.equal(updated, undefined, "empty input is ignored");
    assert.equal(saved, undefined, "empty input is not saved");
  }
}

const { transpileModule, ModuleKind, JsxEmit } = require("typescript");
const element = (type, props) => ({ type, props });
const modules = {
  "react/jsx-runtime": { jsx: element, jsxs: element },
  react: {
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
  },
  "react-native": {
    FlatList: "FlatList",
    TextInput: "TextInput",
    Text: "Text",
    View: "View",
    StyleSheet: { create: (styles) => styles, absoluteFill: {} },
  },
  "expo-status-bar": { StatusBar: "StatusBar" },
  "../components/ShoppingListItem": { ShoppingListItem: "ShoppingListItem" },
  "../theme": { theme: { color: { white: "#ffffff", lightGray: "#eee" } } },
  "../utils/storage": {},
};
const screen = { exports: {}, require: (name) => modules[name] };
runInNewContext(
  transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX },
  }).outputText,
  screen,
);
const list = screen.exports
  .default()
  .props.children.find((child) => child.type === "FlatList");
assert.ok(list, "the screen renders FlatList");
assert.equal(list.props.data.length, 0, "the list starts empty");
assert.equal(list.props.stickyHeaderIndices.join(","), "0");
assert.equal(list.props.contentContainerStyle.paddingTop, 12);
assert.equal(
  list.props.ListHeaderComponent.type,
  "TextInput",
  "the header is an element rather than an inline component function",
);
assert.equal(
  list.props.ListHeaderComponent.props.style.backgroundColor,
  "#ffffff",
);
assert.equal(
  list.props.ListHeaderComponent.props.accessibilityLabel,
  "New shopping list item",
);
assert.equal(
  list.props.ListEmptyComponent.props.children.props.children,
  "Your shopping list is empty",
);
const row = list.props.renderItem({
  item: { id: "1", name: "Tea", isCompleted: true },
});
assert.equal(row.type, "ShoppingListItem");
assert.equal(row.props.name, "Tea");
assert.equal(row.props.isCompleted, true, "completed styling is preserved");

console.log("TextInput submission, saving, and FlatList checks pass.");
