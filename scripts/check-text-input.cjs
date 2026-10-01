// Run: node scripts/check-text-input.cjs
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

  runInNewContext(`${handler}\nhandleSubmit();`, {
    value,
    shoppingList,
    setShoppingList: (list) => (updated = list),
    setValue: (text) => (cleared = text),
  });

  assert.deepEqual(shoppingList, original, "existing items are preserved");
  assert.equal(cleared, value ? "" : undefined);
  if (value) {
    assert.equal(updated[0].name, value);
    assert.equal(new Date(updated[0].id).toISOString(), updated[0].id);
    assert.deepEqual(Array.from(updated.slice(1)), original);
  } else {
    assert.equal(updated, undefined, "empty input is ignored");
  }
}

console.log("TextInput submission checks pass.");
