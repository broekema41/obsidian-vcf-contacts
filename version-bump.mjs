import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const type = process.argv[2];

if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: npm run patch | minor | major");
  process.exit(1);
}

try {
  const output = execSync("git diff --name-only", { encoding: "utf-8" });
  const changedFiles = output
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);

  const allowed = new Set([
    "release_changelog.txt",
    "release_title.txt"
  ]);

  const invalid = changedFiles.filter(f => !allowed.has(f));

  if (invalid.length > 0) {
    console.error("❌ You have uncommitted changes in disallowed files:");
    invalid.forEach(f => console.error("   -", f));
    process.exit(1);
  }

} catch (err) {
  console.error("❌ Failed to check git status");
  process.exit(1);
}

execSync(`npm version ${type} --no-git-tag-version`, { stdio: "inherit" });


const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const minAppVersion = manifest.minAppVersion;

manifest.version = version;
writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

const versions = JSON.parse(readFileSync("versions.json", "utf8"));

if (!versions[version]) {
  versions[version] = minAppVersion;
}

writeFileSync("versions.json", JSON.stringify(versions, null, 2) + "\n");


execSync("git add -A", {
  stdio: "inherit"
});

execSync(`git commit -m "version bump: ${version}"`, {
  stdio: "inherit"
});

execSync(`git tag ${version}`, { stdio: "inherit" });

console.log(`🚀 Released ${version} ready for push \n git push origin --tags`);
