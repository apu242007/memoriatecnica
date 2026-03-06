// Quick test: verify docx 8.5.0 API compatibility
const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');

// Check what imports are used from docx
const match = html.match(/const \{([^}]+)\} = docx;/);
if (match) {
  const imports = match[1].split(',').map(s => s.trim());
  console.log("Imports used from docx:", imports.join(', '));
}

// Check for common issues
const issues = [];

// 1. Check if generateDocx calls runCalculations
if (!html.match(/function generateDocx[\s\S]*?runCalculations\(\)/)) {
  // More precise: check within generateDocx function body
  const genDocxStart = html.indexOf('async function generateDocx()');
  const genDocxEnd = html.indexOf('\n// ========================================================', genDocxStart + 1);
  const genDocxBody = html.substring(genDocxStart, genDocxEnd);
  if (!genDocxBody.includes('runCalculations()')) {
    issues.push("CRITICAL: generateDocx() does NOT call runCalculations() — calculatedData may be empty");
  }
}

// 2. Check for .toFixed() on calculatedData properties
const toFixedCalls = html.match(/c\.\w+\.toFixed/g);
if (toFixedCalls) {
  console.log("\n.toFixed() calls on calculatedData (c):", [...new Set(toFixedCalls)].join(', '));
}

// 3. Check for potential undefined property access patterns
const cProps = html.match(/c\.\w+/g);
if (cProps) {
  const unique = [...new Set(cProps)].filter(p => !p.startsWith('c.ext') || p === 'c.extDistRows' || p === 'c.extincion');
  console.log("\nAll c.* property accesses:", unique.join(', '));
}

// 4. Check buildPreview calls runCalculations
if (html.includes('function buildPreview()') && html.match(/function buildPreview[\s\S]*?runCalculations\(\)/)) {
  console.log("\nbuildPreview() DOES call runCalculations() ✓");
}

// 5. Check goToStep(6) calls buildPreview
if (html.includes("if (step === 6) buildPreview()")) {
  console.log("goToStep(6) DOES call buildPreview() ✓");
}

// 6. Look for undefined references in generateDocx
const genDocxStart = html.indexOf('async function generateDocx()');
const genDocxBody = html.substring(genDocxStart, html.indexOf('\nfunction getFormData()', genDocxStart));

// Check for variables used but not declared in scope
const undeclaredPatterns = [
  /materialRows/g,
  /extintorRows/g, 
  /salidaRows/g,
  /brigadaRows/g,
  /pdfData/g,
  /photosData/g,
  /calculatedData/g,
  /croquisHistory/g,
];

console.log("\n=== Variables used in generateDocx (must be global) ===");
undeclaredPatterns.forEach(pattern => {
  const found = genDocxBody.match(pattern);
  if (found) {
    console.log(`  ${pattern.source}: ${found.length} references`);
  }
});

if (issues.length) {
  console.log("\n=== ISSUES FOUND ===");
  issues.forEach(i => console.log("  ⚠", i));
} else {
  console.log("\n=== No critical issues found ===");
}
