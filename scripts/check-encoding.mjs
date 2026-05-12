import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const targets = [
  "src",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "CONTRIBUTING.md",
  "SKILL.md",
  ".editorconfig",
  ".gitattributes",
]
const textExt = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".md", ".html", ".yml", ".yaml"])

const errors = []

function hasBom(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf
}

function walk(entry) {
  const full = path.join(root, entry)
  if (!fs.existsSync(full)) return
  const stat = fs.statSync(full)
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full)) {
      walk(path.join(entry, child))
    }
    return
  }

  const ext = path.extname(full).toLowerCase()
  if (!textExt.has(ext)) return
  const buf = fs.readFileSync(full)
  if (hasBom(buf)) errors.push(`BOM detected: ${entry}`)
}

for (const target of targets) walk(target)

if (errors.length > 0) {
  console.error("Encoding check failed:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log("Encoding check passed (UTF-8 without BOM).")
