import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const testFilePattern = /\.(test|spec)\.(ts|tsx)$/;
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const walk = (dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return testFilePattern.test(entry.name) ? [fullPath] : [];
  });
};

const lineNumberAt = (content, index) => content.slice(0, index).split('\n').length;

const candidatesFor = (fromFile, specifier) => {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [base];

  sourceExtensions.forEach((extension) => {
    candidates.push(`${base}${extension}`);
    candidates.push(path.join(base, `index${extension}`));
  });

  return candidates;
};

const resolves = (candidate) => {
  try {
    return existsSync(candidate) && statSync(candidate).isFile();
  } catch {
    return false;
  }
};

const testFiles = walk(sourceRoot);
const missingImports = [];

testFiles.forEach((file) => {
  const content = readFileSync(file, 'utf8');
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    const specifier = match[1] ?? match[2];
    if (!specifier?.startsWith('.')) {
      continue;
    }

    if (!candidatesFor(file, specifier).some(resolves)) {
      missingImports.push({
        file,
        line: lineNumberAt(content, match.index),
        specifier,
      });
    }
  }
});

if (missingImports.length === 0) {
  console.log(`No stale local test imports found across ${testFiles.length} test files.`);
  process.exit(0);
}

console.error('Stale local imports found in test files:');
missingImports.forEach(({ file, line, specifier }) => {
  console.error(`- ${path.relative(root, file)}:${line} imports "${specifier}", but no matching file exists.`);
});
console.error('\nUpdate, replace, or remove the stale tests before merging.');
process.exit(1);
