import { execSync } from "child_process";
import { writeFileSync } from "fs";

function run(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function tryRun(command) {
  try {
    return run(command);
  } catch {
    return "";
  }
}

function bumpVersion(version, bumpType) {
  const [major, minor, patch] = version.split(".").map(Number);

  if (![major, minor, patch].every(Number.isInteger)) {
    throw new Error(`Invalid version: ${version}`);
  }

  if (bumpType === "major") {
    return `${major + 1}.0.0`;
  }

  if (bumpType === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  if (bumpType === "patch") {
    return `${major}.${minor}.${patch + 1}`;
  }

  throw new Error(`Invalid bump type: ${bumpType}`);
}

function getLastTag() {
  const tagsRaw = tryRun("git tag --sort=-version:refname");
  const tags = tagsRaw ? tagsRaw.split("\n").filter(Boolean) : [];
  return tags[0] || "";
}

function getCommitSubjects(fromRef, toRef = "HEAD") {
  const log = tryRun(`git log ${fromRef}..${toRef} --pretty=format:%s`);
  return log ? log.split("\n").filter(Boolean) : [];
}

function extractTickets(messages) {
  const tickets = new Set();

  for (const message of messages) {
    const matches = message.match(/#[0-9]+/g) || [];
    for (const match of matches) {
      tickets.add(match);
    }
  }

  return [...tickets].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

function filterMessages(messages) {
  return messages.filter((message) => {
    const lower = message.toLowerCase();

    if (lower.startsWith("version bump:")) {
      return false;
    }

    return true;
  });
}

const bumpType = process.argv[2];

if (!["patch", "minor", "major"].includes(bumpType)) {
  console.error("Usage: node release-notes.mjs [patch|minor|major]");
  process.exit(1);
}

const lastTag = getLastTag();

if (!lastTag) {
  console.error("No tags found. Cannot generate release notes.");
  process.exit(1);
}

const nextVersion = bumpVersion(lastTag, bumpType);
const allMessages = getCommitSubjects(lastTag, "HEAD");
const messages = filterMessages(allMessages);
const tickets = extractTickets(messages);

let title = `Releasing ${nextVersion} ${bumpType}`;
if (tickets.length > 0) {
  title += ` including ${tickets.join(" ")}`;
}

let changelog = "## Changes\n";

if (messages.length > 0) {
  changelog += messages.map((message) => `- ${message}`).join("\n");
} else {
  changelog += "- No changes recorded";
}

writeFileSync("release_title.txt", `${title}\n`);
writeFileSync("release_changelog.txt", `${changelog}\n`);

console.log("Generated release_title.txt and release_changelog.txt");
