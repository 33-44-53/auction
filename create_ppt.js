const fs = require('fs');
const path = require('path');

// Create HTML presentation
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flutter Widgets & Lifecycle</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; }
        .slide { width: 100vw; height: 100vh; display: none; padding: 60px; position: relative; }
        .slide.active { display: flex; flex-direction: column; justify-content: center; }
        .slide1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; align-items: center; text-align: center; }
        .slide2, .slide3, .slide4, .slide5 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
        .slide6 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #1a1a1a; }
        .slide7, .slide8 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #1a1a1a; }
        .slide9, .slide10 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #1a1a1a; }
        h1 { font-size: 72px; margin-bottom: 30px; font-weight: 700; }
        h2 { font-size: 48px; margin-bottom: 30px; font-weight: 600; }
        h3 { font-size: 36px; margin-bottom: 20px; font-weight: 600; }
        p, li { font-size: 24px; line-height: 1.6; margin-bottom: 15px; }
        .code { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; font-family: 'Courier New', monospace; margin: 20px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
        .card { background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px; backdrop-filter: blur(10px); }
        ul { margin-left: 40px; }
        .controls { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; }
        button { padding: 15px 30px; font-size: 18px; border: none; border-radius: 50px; cursor: pointer; background: rgba(255,255,255,0.3); backdrop-filter: blur(10px); font-weight: 600; transition: all 0.3s; }
        button:hover { background: rgba(255,255,255,0.5); transform: scale(1.05); }
        .slide-number { position: absolute; bottom: 30px; left: 30px; font-size: 20px; opacity: 0.7; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 15px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3); }
        th { font-weight: 600; font-size: 26px; }
    </style>
</head>
<body>
    <div class="slide slide1 active">
        <h1>Flutter Widgets & Lifecycle</h1>
        <p style="font-size: 32px; margin-top: 20px;">Common Layout Widgets & Responsive Design</p>
        <div class="slide-number">1 / 10</div>
    </div>

    <div class="slide slide2">
        <h2>Common Layout Widgets in Flutter</h2>
        <div class="grid">
            <div class="card">
                <h3>Container</h3>
                <p>A box widget that can contain a single child. It supports width, height, padding, margin, decoration (color, border, border radius, shadow, gradient), and alignment. It is the most flexible single-child layout widget.</p>
            </div>
            <div class="card">
                <h3>Row</h3>
                <p>Arranges its children horizontally (left to right). The main axis is horizontal and the cross axis is vertical. Key properties: mainAxisAlignment, crossAxisAlignment, mainAxisSize.</p>
            </div>
        </div>
        <div class="slide-number">2 / 10</div>
    </div>

    <div class="slide slide3">
        <h2>More Layout Widgets</h2>
        <div class="grid">
            <div class="card">
                <h3>Column</h3>
                <p>Arranges its children vertically (top to bottom). The main axis is vertical and the cross axis is horizontal. Key properties: mainAxisAlignment, crossAxisAlignment, mainAxisSize.</p>
            </div>
            <div class="card">
                <h3>Stack</h3>
                <p>Layers its children on top of each other. Children are painted in the order they appear in the list. It is used for overlapping elements. Children can be positioned using Positioned or Align.</p>
            </div>
        </div>
        <div class="slide-number">3 / 10</div>
    </div>

    <div class="slide slide4">
        <h2>What is Responsive Design?</h2>
        <div class="card">
            <p>Responsive design is the practice of building user interfaces that automatically adapt to different screen sizes, orientations, pixel densities, and device types while maintaining usability and visual quality. The layout, text size, spacing, and component arrangement change based on the available screen space.</p>
        </div>
        <div class="slide-number">4 / 10</div>
    </div>

    <div class="slide slide5">
        <h2>Flutter Responsiveness Tools</h2>
        <table>
            <tr><th>Tool</th><th>Purpose</th></tr>
            <tr><td>MediaQuery</td><td>Retrieves device information such as screen size, orientation, padding</td></tr>
            <tr><td>LayoutBuilder</td><td>Builds widgets based on exact constraints from parent</td></tr>
            <tr><td>Expanded/Flexible</td><td>Share available space proportionally in Row/Column</td></tr>
            <tr><td>FractionallySizedBox</td><td>Sizes child as fraction of parent (e.g., 50%)</td></tr>
        </table>
        <div class="slide-number">5 / 10</div>
    </div>

    <div class="slide slide6">
        <h2>More Responsiveness Tools</h2>
        <table>
            <tr><th>Tool</th><th>Purpose</th></tr>
            <tr><td>AspectRatio</td><td>Forces widget to maintain specific width-to-height ratio</td></tr>
            <tr><td>SafeArea</td><td>Adds padding to avoid system UI elements like notches</td></tr>
            <tr><td>OrientationBuilder</td><td>Rebuilds UI when device orientation changes</td></tr>
        </table>
        <p style="margin-top: 30px;">These tools enable developers to create layouts that scale and rearrange automatically across phones, tablets, and different orientations without fixed pixel values.</p>
        <div class="slide-number">6 / 10</div>
    </div>

    <div class="slide slide7">
        <h2>Widget Lifecycle</h2>
        <div class="card">
            <p>A widget lifecycle is the sequence of methods that Flutter calls automatically as a widget is created, updated, and destroyed in the widget tree. It applies mainly to StatefulWidget (because it has mutable state). StatelessWidget has only one method: build().</p>
        </div>
        <div class="slide-number">7 / 10</div>
    </div>

    <div class="slide slide8">
        <h2>Key Lifecycle Stages</h2>
        <ul>
            <li><strong>createState()</strong> - Called when StatefulWidget is inserted into tree. Creates State object.</li>
            <li><strong>initState()</strong> - Called once when State is first created. Use for initialization.</li>
            <li><strong>didChangeDependencies()</strong> - Called after initState() and when inherited widgets change.</li>
            <li><strong>build()</strong> - Called every time widget needs to render or re-render UI.</li>
            <li><strong>didUpdateWidget()</strong> - Called when parent widget rebuilds with new configuration.</li>
        </ul>
        <div class="slide-number">8 / 10</div>
    </div>

    <div class="slide slide9">
        <h2>More Lifecycle Stages</h2>
        <ul>
            <li><strong>reassemble()</strong> - Called during hot reload (development only).</li>
            <li><strong>deactivate()</strong> - Called when State is temporarily removed from tree.</li>
            <li><strong>dispose()</strong> - Called when State is permanently removed. Use to clean up resources (controllers, streams, listeners, animations) to prevent memory leaks.</li>
        </ul>
        <div class="slide-number">9 / 10</div>
    </div>

    <div class="slide slide10">
        <h2>Why Lifecycle Understanding is Important</h2>
        <ul>
            <li>Prevents memory leaks by properly disposing resources in dispose().</li>
            <li>Avoids unnecessary rebuilds and improves performance.</li>
            <li>Ensures correct initialization (e.g., calling APIs only once in initState()).</li>
            <li>Helps handle configuration changes (theme, localization, screen size) in didChangeDependencies().</li>
            <li>Makes debugging easier when widgets behave unexpectedly during updates or navigation.</li>
        </ul>
        <p style="margin-top: 30px; font-weight: 600;">Mastering the lifecycle lets you write efficient, bug-free Flutter code that scales well across different app flows.</p>
        <div class="slide-number">10 / 10</div>
    </div>

    <div class="controls">
        <button onclick="prevSlide()">← Previous</button>
        <button onclick="nextSlide()">Next →</button>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        
        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        
        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'flutter_presentation.html'), html);
console.log('✅ Presentation created: flutter_presentation.html');
console.log('Open it in your browser to view the slides!');
