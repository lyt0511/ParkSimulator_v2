import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { stripTypeScriptTypes } from "node:module";

const cwd = process.cwd();
const srcRoot = join(cwd, "src");
const outputRoot = join(srcRoot, ".demo-gen");
const entryFile = join(srcRoot, "play-page.ts");

if (!existsSync(entryFile)) {
  console.error(`[demo:prepare] entry file not found: ${relative(cwd, entryFile)}`);
  process.exit(1);
}

function isLocalSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function normalizePath(path) {
  return path.replace(/\\/g, "/");
}

function parseImportSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /from\s+["']([^"']+)["']/g,
    /import\s+["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

function resolveLocalTsModule(importerFile, specifier) {
  const base = resolve(dirname(importerFile), specifier);
  const ext = extname(base);
  const candidates =
    ext === ".ts"
      ? [base]
      : ext.length === 0
        ? [`${base}.ts`, join(base, "index.ts")]
        : [];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const normalized = normalizePath(candidate);
      const normalizedSrc = normalizePath(srcRoot);
      if (!normalized.startsWith(normalizedSrc)) {
        console.error(
          `[demo:prepare] local import escapes src/: ${specifier} in ${relative(cwd, importerFile)}`,
        );
        process.exit(1);
      }
      return candidate;
    }
  }

  return null;
}

function rewriteLocalSpecifier(specifier) {
  if (!isLocalSpecifier(specifier)) {
    return specifier;
  }

  if (specifier.endsWith(".ts")) {
    return `${specifier.slice(0, -3)}.js`;
  }

  return specifier;
}

function rewriteImportSpecifiers(source) {
  let output = source;
  output = output.replace(/(from\s+["'])([^"']+)(["'])/g, (_, prefix, specifier, suffix) => {
    return `${prefix}${rewriteLocalSpecifier(specifier)}${suffix}`;
  });
  output = output.replace(/(import\s+["'])([^"']+)(["'])/g, (_, prefix, specifier, suffix) => {
    return `${prefix}${rewriteLocalSpecifier(specifier)}${suffix}`;
  });
  output = output.replace(
    /(import\s*\(\s*["'])([^"']+)(["']\s*\))/g,
    (_, prefix, specifier, suffix) => {
      return `${prefix}${rewriteLocalSpecifier(specifier)}${suffix}`;
    },
  );
  return output;
}

function collectDependencyGraph(entry) {
  const queue = [entry];
  const visited = new Set();
  const ordered = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    ordered.push(current);

    const source = readFileSync(current, "utf8");
    const specifiers = parseImportSpecifiers(source).filter((specifier) => isLocalSpecifier(specifier));

    for (const specifier of specifiers) {
      const resolved = resolveLocalTsModule(current, specifier);
      if (!resolved) {
        console.error(
          `[demo:prepare] unresolved local import "${specifier}" in ${relative(cwd, current)}`,
        );
        process.exit(1);
      }
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return ordered;
}

function emitRuntimeFiles(files) {
  rmSync(outputRoot, { recursive: true, force: true });

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    let stripped;
    try {
      stripped = stripTypeScriptTypes(source);
    } catch (error) {
      console.error(`[demo:prepare] failed to strip types for ${relative(cwd, file)}`);
      console.error(error);
      process.exit(1);
    }

    const rewritten = rewriteImportSpecifiers(stripped);
    const relativePath = relative(srcRoot, file).replace(/\.ts$/, ".js");
    const outputFile = join(outputRoot, relativePath);
    mkdirSync(dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, rewritten, "utf8");
    console.log(`[demo:prepare] generated ${normalizePath(relative(cwd, outputFile))}`);
  }
}

const graph = collectDependencyGraph(entryFile).sort((a, b) => a.localeCompare(b));
emitRuntimeFiles(graph);
console.log(`[demo:prepare] completed (${graph.length} files)`);
