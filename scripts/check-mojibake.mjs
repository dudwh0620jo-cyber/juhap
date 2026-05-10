import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const defaultTargets = [
  "src/pages/CommunityWrite.tsx",
  "src/pages/Community.tsx",
  "src/pages/PairingDetail.tsx",
  "src/pages/Category.tsx",
  "src/pages/CategoryList.tsx",
  "src/hooks/useHomePageData.ts",
  "src/data",
]
const textExt = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".md"])

const suspicious = [
  /\uFFFD/u,
  /[\u6e72\u5bc3\uf9de\u8e42\u907a\u91ab\u5a9b]/u,
  /[\u3400-\u9fff\uf900-\ufaff]\?/u,
  /\?[\u3400-\u9fff\uf900-\ufaff]/u,
  /\?[\uac00-\ud7af]{2,}/u,
  /[\u3040-\u30ff]/u,
]

const findings = []

function shouldCheck(full) {
  return textExt.has(path.extname(full).toLowerCase())
}

function walk(target) {
  const full = path.resolve(root, target)
  if (!fs.existsSync(full)) return

  const stat = fs.statSync(full)
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full)) {
      walk(path.join(target, child))
    }
    return
  }

  if (!shouldCheck(full)) return

  const rel = path.relative(root, full)
  const text = fs.readFileSync(full, "utf8")
  text.split(/\r?\n/u).forEach((line, index) => {
    if (!suspicious.some((pattern) => pattern.test(line))) return
    findings.push(`${rel}:${index + 1}: ${line.trim().slice(0, 160)}`)
  })
}

const targets = process.argv.slice(2)
for (const target of targets.length > 0 ? targets : defaultTargets) {
  walk(target)
}

if (findings.length > 0) {
  console.error("Mojibake check failed:")
  for (const item of findings) console.error(`- ${item}`)
  process.exit(1)
}

console.log("Mojibake check passed.")
