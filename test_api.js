// Test docx 8.5.0 API compatibility with the exact calls from generateDocx
const docx = require('docx');

const imports = [
  'Document', 'Packer', 'Paragraph', 'TextRun', 'Table', 'TableRow', 'TableCell',
  'WidthType', 'AlignmentType', 'HeadingLevel', 'BorderStyle', 'PageNumber',
  'NumberFormat', 'Header', 'Footer', 'ShadingType', 'VerticalAlign',
  'TableLayoutType', 'PageBreak', 'Tab', 'ImageRun'
];

console.log("=== Checking docx 8.5.0 exports ===");
const missing = [];
imports.forEach(name => {
  if (docx[name] === undefined) {
    missing.push(name);
    console.log(`  ❌ ${name} — NOT EXPORTED`);
  } else {
    console.log(`  ✓ ${name} — ${typeof docx[name]}`);
  }
});

if (missing.length) {
  console.log(`\n⚠ MISSING EXPORTS: ${missing.join(', ')}`);
} else {
  console.log("\n✓ All imports available");
}

// Test creating the exact structures used in generateDocx
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, HeadingLevel, BorderStyle, PageNumber,
        NumberFormat, Header, Footer, ShadingType, VerticalAlign,
        TableLayoutType, PageBreak, Tab, ImageRun } = docx;

console.log("\n=== Testing API patterns ===");

try {
  // Test 1: PageBreak in Paragraph children
  const pb = new Paragraph({ children: [new PageBreak()] });
  console.log("  ✓ PageBreak in Paragraph children");
} catch(e) {
  console.log(`  ❌ PageBreak: ${e.message}`);
}

try {
  // Test 2: Tab in TextRun children
  const tr = new TextRun({ children: [new Tab()], font: 'Arial', size: 14 });
  console.log("  ✓ Tab in TextRun children");
} catch(e) {
  console.log(`  ❌ Tab: ${e.message}`);
}

try {
  // Test 3: PageNumber in TextRun children
  const pn = new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14 });
  console.log("  ✓ PageNumber.CURRENT in TextRun children");
} catch(e) {
  console.log(`  ❌ PageNumber.CURRENT: ${e.message}`);
}

try {
  // Test 4: PageNumber.TOTAL_PAGES
  const tp = new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 14 });
  console.log("  ✓ PageNumber.TOTAL_PAGES in TextRun children");
} catch(e) {
  console.log(`  ❌ PageNumber.TOTAL_PAGES: ${e.message}`);
}

try {
  // Test 5: Header with Paragraph
  const h = new Header({
    children: [new Paragraph({
      children: [new TextRun({ text: 'Test Header', font: 'Arial', size: 16, color: '888888', italics: true })],
      alignment: AlignmentType.RIGHT,
    })]
  });
  console.log("  ✓ Header creation");
} catch(e) {
  console.log(`  ❌ Header: ${e.message}`);
}

try {
  // Test 6: Footer with tabStops
  const f = new Footer({
    children: [new Paragraph({
      children: [new TextRun({ text: 'Footer text', font: 'Arial', size: 14 })],
      tabStops: [{ type: 'right', position: 9026 }],
    })]
  });
  console.log("  ✓ Footer with tabStops string type");
} catch(e) {
  console.log(`  ❌ Footer tabStops: ${e.message}`);
}

try {
  // Test 7: ShadingType.SOLID
  const tc = new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: 'cell', font: 'Arial', size: 20 })] })],
    shading: { type: ShadingType.SOLID, color: 'D6DCE4' },
    verticalAlign: VerticalAlign.CENTER,
  });
  console.log("  ✓ TableCell with ShadingType.SOLID");
} catch(e) {
  console.log(`  ❌ ShadingType: ${e.message}`);
}

try {
  // Test 8: Table with TableRow
  const t = new Table({
    rows: [new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Label', font: 'Arial', size: 20, bold: true })] })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Value', font: 'Arial', size: 20 })] })],
          width: { size: 65, type: WidthType.PERCENTAGE },
        }),
      ]
    })],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
  console.log("  ✓ Table creation");
} catch(e) {
  console.log(`  ❌ Table: ${e.message}`);
}

try {
  // Test 9: ImageRun with fake Uint8Array (small PNG)
  const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const img = new ImageRun({ data: pngHeader, transformation: { width: 250, height: 90 } });
  console.log("  ✓ ImageRun creation");
} catch(e) {
  console.log(`  ❌ ImageRun: ${e.message}`);
}

try {
  // Test 10: Full Document creation (minimal, mimicking generateDocx structure)
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 22 } }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1417, bottom: 1417, left: 1417, right: 1417 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: 'Test Header', font: 'Arial', size: 16, color: '888888', italics: true })],
            alignment: AlignmentType.RIGHT,
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Test footer', font: 'Arial', size: 14, color: '888888' }),
              new TextRun({ children: [new Tab()], font: 'Arial', size: 14 }),
              new TextRun({ text: 'Pág. ', font: 'Arial', size: 14, color: '888888' }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: '888888' }),
              new TextRun({ text: ' / ', font: 'Arial', size: 14, color: '888888' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 14, color: '888888' }),
            ],
            tabStops: [{ type: 'right', position: 9026 }],
          })]
        })
      },
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'TITLE', font: 'Arial', size: 36, bold: true, color: '1a2744' })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Heading', font: 'Arial', size: 28, bold: true, color: '1a2744' })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Body text', font: 'Arial', size: 22 })],
          spacing: { after: 120 },
        }),
        new Paragraph({ children: [new PageBreak()] }),
        new Table({
          rows: [new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'X', font: 'Arial', size: 20 })] })],
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'FFF3E0' },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 3, color: 'E67E22' },
                  bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E67E22' },
                  left: { style: BorderStyle.SINGLE, size: 3, color: 'E67E22' },
                  right: { style: BorderStyle.SINGLE, size: 3, color: 'E67E22' },
                },
              })
            ]
          })],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ]
    }]
  });
  console.log("  ✓ Full Document creation");
  
  // Test packing
  Packer.toBuffer(doc).then(buf => {
    console.log(`  ✓ Packer.toBuffer succeeded (${buf.length} bytes)`);
    console.log("\n=== ALL TESTS PASSED ===");
  }).catch(e => {
    console.log(`  ❌ Packer.toBuffer: ${e.message}`);
    console.log(e.stack);
  });
} catch(e) {
  console.log(`  ❌ Document creation: ${e.message}`);
  console.log(e.stack);
}
