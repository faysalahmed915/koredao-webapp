/**
 * Translation validation script.
 * Checks that all keys in en.json exist in bn.json and vice versa.
 * Run with: node scripts/validate-translations.js
 */

const fs = require("fs");
const path = require("path");

const EN_PATH = path.join(
  process.cwd(),
  "src/i18n/dictionaries/en.json"
);
const BN_PATH = path.join(
  process.cwd(),
  "src/i18n/dictionaries/bn.json"
);

const en = JSON.parse(fs.readFileSync(EN_PATH, "utf-8"));
const bn = JSON.parse(fs.readFileSync(BN_PATH, "utf-8"));

let missingInBn = [];
let missingInEn = [];
let errors = 0;

function compareKeys(enObj, bnObj, prefix = "") {
  for (const key of Object.keys(enObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in bnObj)) {
      missingInBn.push(fullKey);
      errors++;
    } else if (
      typeof enObj[key] === "object" &&
      typeof bnObj[key] === "object" &&
      !Array.isArray(enObj[key])
    ) {
      compareKeys(enObj[key], bnObj[key], fullKey);
    }
  }

  for (const key of Object.keys(bnObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in enObj)) {
      missingInEn.push(fullKey);
      errors++;
    }
  }
}

compareKeys(en, bn);

if (errors > 0) {
  console.error(`\n❌ Translation validation failed: ${errors} missing keys\n`);
  if (missingInBn.length > 0) {
    console.error("Missing in bn.json:");
    missingInBn.forEach((k) => console.error(`  - ${k}`));
  }
  if (missingInEn.length > 0) {
    console.error("Missing in en.json:");
    missingInEn.forEach((k) => console.error(`  - ${k}`));
  }
  process.exit(1);
} else {
  console.log(
    `\n✅ Translation validation passed: all keys present in both en.json and bn.json`
  );
}
