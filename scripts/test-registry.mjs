import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const registryDirectory = join(root, "public", "r");
const internalHelpers = new Set([
  "src/components/ui/feedback-icons.tsx",
  "src/components/ui/overlay-accessibility.tsx",
]);

async function listComponentSources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listComponentSources(path);
    return entry.isFile() && entry.name.endsWith(".tsx")
      ? [relative(root, path).split(sep).join("/")]
      : [];
  }));
  return files.flat();
}

const server = createServer(async (request, response) => {
  const match = /^\/r\/([a-z0-9-]+\.json)$/.exec(new URL(request.url ?? "/", "http://localhost").pathname);
  if (!match) {
    response.writeHead(404).end();
    return;
  }

  try {
    const content = await readFile(join(registryDirectory, match[1]));
    response.writeHead(200, { "content-type": "application/json" }).end(content);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    response.writeHead(404).end();
  }
});

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}/r`;
  const response = await fetch(`${baseUrl}/registry.json`);
  assert.equal(response.status, 200, "registry index should be served");

  const registry = await response.json();
  assert(registry.items.length > 0, "registry should advertise at least one item");

  const sourceComponents = (await listComponentSources(join(root, "src", "components")))
    .filter((path) => !internalHelpers.has(path))
    .sort();
  const registryComponents = registry.items
    .flatMap((item) => item.files.map((file) => file.path))
    .filter((path) => path.startsWith("src/components/") && path.endsWith(".tsx"))
    .filter((path) => !internalHelpers.has(path))
    .filter((path, index, paths) => paths.indexOf(path) === index)
    .sort();
  assert.deepEqual(
    registryComponents,
    sourceComponents,
    "every public component source should be included in the registry",
  );

  for (const item of registry.items) {
    const itemResponse = await fetch(`${baseUrl}/${item.name}.json`);
    assert.equal(itemResponse.status, 200, `${item.name} should be served`);

    const generated = await itemResponse.json();
    assert.equal(generated.name, item.name, `${item.name} should match its registry entry`);
    assert(generated.files?.length > 0, `${item.name} should include files`);
    for (const file of generated.files) {
      assert.equal(typeof file.content, "string", `${item.name} ${file.path} should have content`);
      assert(file.content.length > 0, `${item.name} ${file.path} should not be empty`);
    }
  }

  console.log(`Registry smoke test passed: all ${sourceComponents.length} public components are included across ${registry.items.length} items, with file content served.`);
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
