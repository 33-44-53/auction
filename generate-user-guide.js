const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, NumberingFormat, UnderlineType
} = require('docx');
const fs = require('fs');

function h1(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 }
  });
}
function h2(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 }
  });
}
function h3(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 }
  });
}
function p(text) {
  return new Paragraph({ text, spacing: { after: 120 } });
}
function bullet(text) {
  return new Paragraph({
    text: '• ' + text,
    indent: { left: 400 },
    spacing: { after: 80 }
  });
}
function bold(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true })],
    spacing: { after: 100 }
  });
}
function note(text) {
  return new Paragraph({
    children: [new TextRun({ text: 'NOTE: ' + text, italics: true, color: '555555' })],
    spacing: { after: 100 }
  });
}
function sep() {
  return new Paragraph({ text: '', spacing: { after: 200 } });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(c => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: c, bold: isHeader })]
      })],
      width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA }
    }))
  });
}

function simpleTable(headers, rows) {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r))
    ]
  });
}

const doc = new Document({
  sections: [{
    children: [
      // Title
      new Paragraph({
        children: [new TextRun({ text: 'Dire Dawa Customs Commission', bold: true, size: 36 })],
        alignment: AlignmentType.CENTER, spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Tender Management System', bold: true, size: 48, color: '1a56db' })],
        alignment: AlignmentType.CENTER, spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'User Guide', size: 32, italics: true, color: '444444' })],
        alignment: AlignmentType.CENTER, spacing: { after: 400 }
      }),
      sep(),

      // 1. Overview
      h1('1. System Overview'),
      p('The Tender Management System (TMS) is a web-based application for managing the full lifecycle of customs auction tenders at Dire Dawa Customs Commission. It handles Auction (ጨረታ), Haraj (ሀራጅ), and Yasbela (ያስበላ) tender types.'),
      sep(),

      // 2. Login
      h1('2. Login'),
      p('Open your browser and go to the system URL. Enter your email and password, then click Login.'),
      bullet('Default Admin: admin@tender.com / admin123'),
      bullet('Default Staff: staff@tender.com / staff123'),
      note('Change default passwords immediately after first login.'),
      sep(),

      // 3. Roles
      h1('3. User Roles'),
      simpleTable(
        ['Role', 'Permissions'],
        [
          ['ADMIN', 'Full access: create, edit, delete tenders, groups, bidders, users, view audit logs'],
          ['STAFF', 'Create and manage tenders, groups, bids. Cannot delete or manage users.'],
          ['VIEWER', 'Read-only access to tenders and groups.'],
        ]
      ),
      sep(),

      // 4. Dashboard
      h1('4. Dashboard'),
      p('After login you land on the Dashboard showing:'),
      bullet('Total Tenders — number of tenders in the system'),
      bullet('Total Groups — all bidding groups across tenders'),
      bullet('Total Bidders — registered bidders'),
      bullet('Total Value — sum of all base prices'),
      bullet('Groups by Status — breakdown of OPEN / SOLD / SPLIT / YASBELA groups'),
      bullet('Recent Tenders — quick links to the latest tenders'),
      sep(),

      // 5. Tenders
      h1('5. Managing Tenders'),

      h2('5.1 Create a Tender'),
      p('Go to Tenders → click "+ New Tender". Choose a mode:'),
      bullet('Upload Excel — upload an .xlsx file. The system auto-reads tender number, groups, items, exchange rate, date, location, and responsible body from the file.'),
      bullet('Manual Entry — fill in the form fields manually, then add groups and items one by one.'),
      p('Select the Tender Type:'),
      simpleTable(
        ['Type', 'Description'],
        [
          ['AUCTION (ጨረታ)', 'Standard auction. Uses CIF → FOB → TAX round system.'],
          ['HARAJ (ሀራጅ)', 'Haraj auction. Uses lowest price as base. Select round 1, 2, or 3.'],
          ['YASBELA (ያስበላ)', 'Re-auction after winner cancellation. Can reference original tender.'],
        ]
      ),
      note('For Excel upload, only the Tender Number field is required. All other metadata is read from the Excel file.'),
      sep(),

      h2('5.2 Excel File Format'),
      p('The Excel file must contain the following columns per group:'),
      bullet('Tender Number, Exchange Rate, Date, Location, Responsible Body'),
      bullet('Group Code (ኮድ-10), Group Name'),
      bullet('Item Code, Serial Number, Name, Brand, Country, Unit'),
      bullet('Warehouse 1, Warehouse 2, Warehouse 3 quantities'),
      bullet('FOB price, CIF price, Tax price'),
      p('Amharic column headers are automatically detected and parsed.'),
      sep(),

      h2('5.3 View Tender Details'),
      p('Click the eye icon or "Manage" on any tender to open its detail page. You will see:'),
      bullet('Tender metadata (number, type, status, responsible body)'),
      bullet('All groups with their status, round, base price, bidder count'),
      bullet('Export buttons: Excel and PDF'),
      sep(),

      h2('5.4 Delete a Tender'),
      p('Only ADMIN users can delete tenders. Click the trash icon next to a tender in the list. This permanently removes the tender and all its groups, items, and bids.'),
      sep(),

      // 6. Groups
      h1('6. Managing Groups'),

      h2('6.1 What is a Group?'),
      p('A Group (ኮድ-10) is an independent bidding unit within a tender. Each group has its own items, base price, bidders, and bids. Groups go through rounds independently.'),
      sep(),

      h2('6.2 Group Statuses'),
      simpleTable(
        ['Status', 'Meaning'],
        [
          ['OPEN', 'Active — accepting bids'],
          ['SOLD', 'Closed — winner selected'],
          ['SPLIT', 'Original group split into sub-groups'],
          ['YASBELA', 'Winner cancelled — 5% penalty applied, re-auctioned'],
          ['HARAJ', 'Converted to Haraj mode'],
        ]
      ),
      sep(),

      h2('6.3 Round System (Auction)'),
      p('For Auction tenders, each group starts at the highest price round and can move down:'),
      bullet('Round 1: Highest of CIF, FOB, TAX'),
      bullet('Round 2: Middle value'),
      bullet('Round 3: Lowest value'),
      p('Example: If TAX=100, CIF=80, FOB=60 → Round 1=TAX, Round 2=CIF, Round 3=FOB'),
      p('Use "Next Round →" to advance and "← Prev Round" to go back. The base price recalculates automatically.'),
      sep(),

      h2('6.4 Add a Bid'),
      p('Open a group → click "+ Add Bid". Then:'),
      bullet('Search for an existing bidder by name, company, or phone'),
      bullet('Or click "+ New Bidder" to register a new bidder on the spot'),
      bullet('Enter the bid amount (must be ≥ base price)'),
      bullet('Click "Submit Bid"'),
      note('Submitting a bid for the same bidder in the same round updates their existing bid.'),
      sep(),

      h2('6.5 Close a Group (Select Winner)'),
      p('When bidding is complete, click "✓ Close Group". The system automatically selects the bidder with the highest bid as the winner. The group status changes to SOLD.'),
      sep(),

      h2('6.6 Send to Haraj'),
      p('If a group does not sell in auction rounds, click "🔨 Send to Haraj". Choose the Haraj round (1, 2, or 3) and optionally set a custom base price. The group converts to HARAJ mode using the lowest price (min of CIF, FOB, TAX) as the base.'),
      p('To undo, click "← Revert from Haraj" to return to normal CIF/FOB/TAX rounds.'),
      sep(),

      h2('6.7 Reopen a Group'),
      p('ADMIN only. If a group was closed by mistake, click "🔓 Reopen Group". This clears the winner and allows new bids.'),
      sep(),

      h2('6.8 Apply Yasbela'),
      p('If the winner cancels (written request or 5-day no-show), click "↩ Apply Yasbela" on a SOLD group:'),
      bullet('A 5% CPO penalty is calculated on the winner price'),
      bullet('The original group is marked YASBELA'),
      bullet('A new group is created in the same (or a selected) tender for re-auction'),
      bullet('All items are copied to the new group'),
      sep(),

      h2('6.9 Split a Group'),
      p('ADMIN only. Large groups can be split into smaller sub-groups. The original group is marked SPLIT and new sub-groups (e.g., CODE-10A, CODE-10B) are created with items distributed as assigned.'),
      sep(),

      // 7. Items
      h1('7. Managing Items'),
      p('Inside a group, you can add, edit, or delete items manually:'),
      bullet('Click "+ Add Item" to add a new item to the group'),
      bullet('Click "Edit" next to an item to update its details'),
      bullet('Click the trash icon to delete an item (ADMIN only)'),
      p('Item fields: Model/Code, Serial Number, Name, Type, Brand, Country, Unit, Warehouse 1/2/3 quantities, CIF price, FOB price, Tax price.'),
      p('Unit Price and Total Price are calculated automatically based on the current round and exchange rate.'),
      sep(),

      // 8. Bidders
      h1('8. Managing Bidders'),
      p('Go to Bidders (ADMIN only) to view all registered bidders. Click "+ Add Bidder" to register a new one.'),
      p('Bidder fields: Name, Company Name, Phone (required), Email, Address, TIN.'),
      note('Bidders can also be created on-the-fly when submitting a bid from the group page.'),
      sep(),

      // 9. Export
      h1('9. Exporting Reports'),
      simpleTable(
        ['Export', 'How to Access', 'Description'],
        [
          ['Tender Excel', 'Tender detail page → ⬇ Excel', 'Full tender with all groups and items'],
          ['Tender PDF', 'Tender detail page → ⬇ PDF', 'Printable PDF of the tender'],
          ['Bids Excel', 'Group page → ⬇ Bids Excel', 'List of bids without prices (for display)'],
          ['Winners Excel', 'Group page (SOLD) → 📊 Winners Excel', 'Closed group report with calculations'],
          ['Winner Letter', 'Group page (SOLD) → 📄 Winner Letter', 'የመሸኛ ደብደዳቤ — official winner notification letter (.docx)'],
        ]
      ),
      sep(),

      // 10. Users
      h1('10. User Management (Admin Only)'),
      p('Go to Users to manage system accounts:'),
      bullet('Click "+ Add User" to create a new account (Name, Email, Password, Role)'),
      bullet('Change a user\'s role using the dropdown in the table'),
      bullet('Deactivate/Activate users using the toggle button'),
      bullet('Delete users with the trash icon'),
      sep(),

      // 11. Audit Logs
      h1('11. Audit Logs (Admin Only)'),
      p('Go to Audit Logs to see a full history of all actions in the system including logins, tender uploads, bids, winner selections, and deletions. Each entry shows the time, user, action type, and details.'),
      sep(),

      // 12. Price Calculations
      h1('12. Price Calculations'),
      p('The system calculates prices as follows:'),
      bullet('Unit Price = Selected Round Price × Exchange Rate'),
      bullet('Total Price = Unit Price × Total Quantity'),
      bullet('Group Base Price = SUM of all item Total Prices'),
      bullet('Total Quantity = Warehouse 1 + Warehouse 2 + Warehouse 3'),
      p('For Haraj: Unit Price = MIN(CIF, FOB, TAX) × Exchange Rate'),
      sep(),

      // 13. Tips
      h1('13. Tips & Best Practices'),
      bullet('Always preview the Excel file before submitting to verify group and item counts.'),
      bullet('Use the "Next Round" button only when no bids are received in the current round.'),
      bullet('Export the Winners Excel immediately after closing a group for record keeping.'),
      bullet('Use Yasbela only after receiving a written cancellation or after 5 days of no-show.'),
      bullet('Regularly check Audit Logs to monitor system activity.'),
      sep(),

      // Footer
      new Paragraph({
        children: [new TextRun({ text: 'Dire Dawa Customs Commission — Tender Management System v1.0', italics: true, color: '888888', size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('User_Guide_TMS.docx', buf);
  console.log('Done: User_Guide_TMS.docx');
});
