import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = process.cwd()
const targets = [
  path.join(root, "src", "data"),
  path.join(root, "package.json"),
  path.join(root, "package-lock.json"),
  path.join(root, "tsconfig.json"),
  path.join(root, "tsconfig.app.json"),
  path.join(root, "tsconfig.node.json"),
]

const bad = []

function checkFile(full) {
  const rel = path.relative(root, full)
  try {
    const text = fs.readFileSync(full, "utf8")
    if (path.basename(full).startsWith("tsconfig")) {
      const result = ts.parseConfigFileTextToJson(full, text)
      if (result.error) {
        throw new Error(ts.flattenDiagnosticMessageText(result.error.messageText, "\n"))
      }
      return
    }
    JSON.parse(text)
  } catch (error) {
    bad.push(`${rel}: ${error.message}`)
  }
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full)
      continue
    }
    if (!name.endsWith(".json")) continue
    checkFile(full)
  }
}

let checkedAny = false

for (const target of targets) {
  if (!fs.existsSync(target)) continue
  checkedAny = true
  const stat = fs.statSync(target)
  if (stat.isDirectory()) {
    walk(target)
    continue
  }
  if (target.endsWith(".json")) {
    checkFile(target)
  }
}

if (!checkedAny) {
  console.log("No JSON targets found. Skip JSON check.")
  process.exit(0)
}

if (bad.length > 0) {
  console.error("JSON parse check failed:")
  for (const item of bad) console.error(`- ${item}`)
  process.exit(1)
}

console.log("JSON parse check passed.")
