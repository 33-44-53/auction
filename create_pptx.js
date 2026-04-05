const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Flutter Developer';
pptx.title = 'Flutter Widgets & Lifecycle';

// Slide 1 - Title
let slide1 = pptx.addSlide();
slide1.background = { fill: '667eea' };
slide1.addText('Flutter Widgets & Lifecycle', { 
    x: 0.5, y: 2.5, w: 9, h: 1.5, fontSize: 60, bold: true, color: 'FFFFFF', align: 'center' 
});
slide1.addText('Common Layout Widgets & Responsive Design', { 
    x: 0.5, y: 4, w: 9, h: 0.8, fontSize: 28, color: 'FFFFFF', align: 'center' 
});

// Slide 2 - Container
let slide2 = pptx.addSlide();
slide2.background = { fill: 'f5576c' };
slide2.addText('Container', { 
    x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 40, bold: true, color: 'FFFFFF' 
});
slide2.addText('A box that can hold one child widget. Extremely versatile — you can give it: width/height, padding, margin, decoration (color, border, borderRadius, boxShadow, gradient), alignment. Think of it as the Swiss-army knife of layout widgets.', { 
    x: 0.5, y: 1, w: 9, h: 1, fontSize: 18, color: 'FFFFFF' 
});
slide2.addShape(pptx.ShapeType.roundRect, { 
    x: 0.5, y: 2.2, w: 9, h: 2.8, fill: { color: '000000', transparency: 30 } 
});
slide2.addText(`Container(
  width: 200,
  height: 150,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.only(top: 20),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [BoxShadow(blurRadius: 10)],
  ),
  child: Text("Hello from Container"),
)`, { 
    x: 0.7, y: 2.4, w: 8.6, h: 2.4, fontSize: 16, color: 'FFFFFF', fontFace: 'Courier New' 
});

// Slide 3 - Row
let slide3 = pptx.addSlide();
slide3.background = { fill: 'f5576c' };
slide3.addText('Row', { 
    x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 40, bold: true, color: 'FFFFFF' 
});
slide3.addText('Arranges children horizontally (left to right). Main axis = horizontal, Cross axis = vertical. Common properties: mainAxisAlignment, crossAxisAlignment, mainAxisSize.', { 
    x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 18, color: 'FFFFFF' 
});
slide3.addShape(pptx.ShapeType.roundRect, { 
    x: 0.5, y: 2, w: 9, h: 3, fill: { color: '000000', transparency: 30 } 
});
slide3.addText(`Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Icon(Icons.star),
    Text("Row Example"),
    ElevatedButton(
      onPressed: () {},
      child: Text("Click")
    ),
  ],
)`, { 
    x: 0.7, y: 2.2, w: 8.6, h: 2.6, fontSize: 16, color: 'FFFFFF', fontFace: 'Courier New' 
});

// Slide 4 - Column
let slide4 = pptx.addSlide();
slide4.background = { fill: 'f5576c' };
slide4.addText('Column', { 
    x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 40, bold: true, color: 'FFFFFF' 
});
slide4.addText('Arranges children vertically (top to bottom). Main axis = vertical, Cross axis = horizontal.', { 
    x: 0.5, y: 1, w: 9, h: 0.6, fontSize: 18, color: 'FFFFFF' 
});
slide4.addShape(pptx.ShapeType.roundRect, { 
    x: 0.5, y: 1.8, w: 9, h: 3.2, fill: { color: '000000', transparency: 30 } 
});
slide4.addText(`Column(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: [
    Text("Top"),
    Spacer(), // pushes items apart
    Text("Bottom"),
  ],
)`, { 
    x: 0.7, y: 2, w: 8.6, h: 2.8, fontSize: 16, color: 'FFFFFF', fontFace: 'Courier New' 
});

// Slide 5 - Stack
let slide5 = pptx.addSlide();
slide5.background = { fill: 'f5576c' };
slide5.addText('Stack', { 
    x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 40, bold: true, color: 'FFFFFF' 
});
slide5.addText('Places children on top of each other (like layers in Photoshop). Children are drawn in the order they appear in the list. Useful for overlapping elements (badges, floating buttons, backgrounds).', { 
    x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 18, color: 'FFFFFF' 
});
slide5.addShape(pptx.ShapeType.roundRect, { 
    x: 0.5, y: 2, w: 9, h: 3, fill: { color: '000000', transparency: 30 } 
});
slide5.addText(`Stack(
  children: [
    Container(width: 300, height: 300, color: Colors.grey),
    Positioned(
      top: 50, left: 50,
      child: Text("Overlapping Text"),
    ),
    Align(
      alignment: Alignment.bottomRight,
      child: FloatingActionButton(onPressed: () {}),
    ),
  ],
)`, { 
    x: 0.7, y: 2.2, w: 8.6, h: 2.6, fontSize: 15, color: 'FFFFFF', fontFace: 'Courier New' 
});

// Slide 6 - Responsive Design
let slide6 = pptx.addSlide();
slide6.background = { fill: '00f2fe' };
slide6.addText('What is Responsive Design?', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
slide6.addShape(pptx.ShapeType.roundRect, { 
    x: 1, y: 1.5, w: 8, h: 3, fill: { color: 'FFFFFF', transparency: 20 } 
});
slide6.addText('Responsive design is the practice of building user interfaces that automatically adapt to different screen sizes, orientations, pixel densities, and device types while maintaining usability and visual quality. The layout, text size, spacing, and component arrangement change based on the available screen space.', { 
    x: 1.3, y: 2, w: 7.4, h: 2, fontSize: 22, color: '1a1a1a', valign: 'middle' 
});

// Slide 7 - Flutter Tools 1
let slide7 = pptx.addSlide();
slide7.background = { fill: '00f2fe' };
slide7.addText('Flutter Responsiveness Tools', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
const rows1 = [
    ['Tool', 'Purpose'],
    ['MediaQuery', 'Retrieves device information such as screen size, orientation, padding'],
    ['LayoutBuilder', 'Builds widgets based on exact constraints from parent'],
    ['Expanded/Flexible', 'Share available space proportionally in Row/Column'],
    ['FractionallySizedBox', 'Sizes child as fraction of parent (e.g., 50%)']
];
slide7.addTable(rows1, { 
    x: 0.5, y: 1.3, w: 9, h: 3.5, fontSize: 18, color: '1a1a1a', 
    fill: { color: 'FFFFFF', transparency: 20 },
    border: { pt: 1, color: '1a1a1a' }
});

// Slide 8 - Flutter Tools 2
let slide8 = pptx.addSlide();
slide8.background = { fill: '00f2fe' };
slide8.addText('More Responsiveness Tools', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
const rows2 = [
    ['Tool', 'Purpose'],
    ['AspectRatio', 'Forces widget to maintain specific width-to-height ratio'],
    ['SafeArea', 'Adds padding to avoid system UI elements like notches'],
    ['OrientationBuilder', 'Rebuilds UI when device orientation changes']
];
slide8.addTable(rows2, { 
    x: 0.5, y: 1.3, w: 9, h: 2.5, fontSize: 18, color: '1a1a1a', 
    fill: { color: 'FFFFFF', transparency: 20 },
    border: { pt: 1, color: '1a1a1a' }
});
slide8.addText('These tools enable developers to create layouts that scale and rearrange automatically across phones, tablets, and different orientations without fixed pixel values.', { 
    x: 0.5, y: 4.2, w: 9, h: 1, fontSize: 20, color: '1a1a1a' 
});

// Slide 9 - Widget Lifecycle
let slide9 = pptx.addSlide();
slide9.background = { fill: '38f9d7' };
slide9.addText('Widget Lifecycle', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
slide9.addShape(pptx.ShapeType.roundRect, { 
    x: 1, y: 1.5, w: 8, h: 3, fill: { color: 'FFFFFF', transparency: 20 } 
});
slide9.addText('A widget lifecycle is the sequence of methods that Flutter calls automatically as a widget is created, updated, and destroyed in the widget tree. It applies mainly to StatefulWidget (because it has mutable state). StatelessWidget has only one method: build().', { 
    x: 1.3, y: 2, w: 7.4, h: 2, fontSize: 22, color: '1a1a1a', valign: 'middle' 
});

// Slide 10 - Lifecycle Stages 1
let slide10 = pptx.addSlide();
slide10.background = { fill: '38f9d7' };
slide10.addText('Key Lifecycle Stages', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
slide10.addText([
    { text: '• createState() ', options: { bold: true } },
    { text: '- Called when StatefulWidget is inserted into tree. Creates State object.\n\n' },
    { text: '• initState() ', options: { bold: true } },
    { text: '- Called once when State is first created. Use for initialization.\n\n' },
    { text: '• didChangeDependencies() ', options: { bold: true } },
    { text: '- Called after initState() and when inherited widgets change.\n\n' },
    { text: '• build() ', options: { bold: true } },
    { text: '- Called every time widget needs to render or re-render UI.\n\n' },
    { text: '• didUpdateWidget() ', options: { bold: true } },
    { text: '- Called when parent widget rebuilds with new configuration.' }
], { 
    x: 0.5, y: 1.3, w: 9, h: 3.5, fontSize: 18, color: '1a1a1a', valign: 'top' 
});

// Slide 11 - Lifecycle Stages 2
let slide11 = pptx.addSlide();
slide11.background = { fill: 'fee140' };
slide11.addText('More Lifecycle Stages', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 40, bold: true, color: '1a1a1a' 
});
slide11.addText([
    { text: '• reassemble() ', options: { bold: true } },
    { text: '- Called during hot reload (development only).\n\n' },
    { text: '• deactivate() ', options: { bold: true } },
    { text: '- Called when State is temporarily removed from tree.\n\n' },
    { text: '• dispose() ', options: { bold: true } },
    { text: '- Called when State is permanently removed. Use to clean up resources (controllers, streams, listeners, animations) to prevent memory leaks.' }
], { 
    x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: '1a1a1a', valign: 'top' 
});

// Slide 12 - Why Important
let slide12 = pptx.addSlide();
slide12.background = { fill: 'fee140' };
slide12.addText('Why Lifecycle Understanding is Important', { 
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1a1a1a' 
});
slide12.addText([
    { text: '• Prevents memory leaks by properly disposing resources in dispose().\n\n' },
    { text: '• Avoids unnecessary rebuilds and improves performance.\n\n' },
    { text: '• Ensures correct initialization (e.g., calling APIs only once in initState()).\n\n' },
    { text: '• Helps handle configuration changes (theme, localization, screen size) in didChangeDependencies().\n\n' },
    { text: '• Makes debugging easier when widgets behave unexpectedly during updates or navigation.\n\n' },
    { text: 'Mastering the lifecycle lets you write efficient, bug-free Flutter code that scales well across different app flows.', options: { bold: true } }
], { 
    x: 0.5, y: 1.3, w: 9, h: 3.5, fontSize: 18, color: '1a1a1a', valign: 'top' 
});

pptx.writeFile({ fileName: 'Flutter_Widgets_Lifecycle_WithCode.pptx' })
    .then(() => console.log('✅ PowerPoint created: Flutter_Widgets_Lifecycle_WithCode.pptx'))
    .catch(err => console.error('Error:', err));
