import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const files = {
  html: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  app: await readFile(new URL("../js/app.js", import.meta.url), "utf8"),
  api: await readFile(new URL("../js/api.js", import.meta.url), "utf8"),
  config: await readFile(new URL("../js/config.js", import.meta.url), "utf8"),
  css: await readFile(new URL("../css/style.css", import.meta.url), "utf8")
};

const htmlIds = [...files.html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const htmlIdSet = new Set(htmlIds);

test("browser JavaScript parses", () => {
  for (const [name, source] of Object.entries({ app: files.app, api: files.api, config: files.config })) {
    assert.doesNotThrow(() => new vm.Script(source, { filename: `${name}.js` }));
  }
});

test("HTML IDs are unique", () => {
  const duplicates = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

test("labels point to existing controls", () => {
  const targets = [...files.html.matchAll(/\bfor="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(targets.filter(id => !htmlIdSet.has(id)), []);
});

test("static DOM lookups point to existing elements", () => {
  const references = [...files.app.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)]
    .map(match => match[1]);
  assert.deepEqual([...new Set(references.filter(id => !htmlIdSet.has(id)))], []);
});

test("every navigation item resolves to a page section", () => {
  const navigationSections = [...files.html.matchAll(/data-section="([^"]+)"/g)]
    .map(match => match[1]);
  const aliases = { projects: "dashboardSection" };
  const missing = navigationSections.filter(section => {
    const targetId = aliases[section] || `${section}Section`;
    return !htmlIdSet.has(targetId);
  });
  assert.deepEqual(missing, []);
});

test("production result panels are present", () => {
  const required = [
    "claimsList",
    "anglesList",
    "scriptSectionsList",
    "visualPlanList",
    "editBlueprintList",
    "publishingPackagesList"
  ];
  assert.deepEqual(required.filter(id => !htmlIdSet.has(id)), []);
});

test("public files do not contain common secret formats", () => {
  const publicSource = Object.values(files).join("\n");
  const secretPatterns = [
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
    /ADMIN_TOKEN\s*[:=]\s*["'][^"']+["']/i,
    /api[_-]?key\s*[:=]\s*["'][^"']{12,}["']/i
  ];
  assert.deepEqual(secretPatterns.filter(pattern => pattern.test(publicSource)), []);
});

test("mobile layout and request timeout safeguards exist", () => {
  assert.match(files.css, /@media\s*\(max-width:\s*(?:850|768)px\)/);
  assert.match(files.css, /@media\s*\(max-width:\s*650px\)/);
  assert.match(files.config, /requestTimeoutMs:\s*20000/);
  assert.match(files.api, /AbortController/);
});

test("deployed assets use the application version for cache busting", () => {
  for (const asset of ["css/style.css", "js/config.js", "js/api.js", "js/app.js"]) {
    assert.match(files.html, new RegExp(`${asset.replace(".", "\\.")}\\?v=0\\.3\\.2`));
  }
});

test("Google Sheets time values are normalized for display", () => {
  assert.match(files.config, /timeZone:\s*"Asia\/Karachi"/);
  assert.match(files.app, /function formatProductionTime\(value\)/);
  assert.match(files.app, /formatProductionRange\(item\.startTime, item\.endTime\)/);
});
