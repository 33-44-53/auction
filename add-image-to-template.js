const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

async function addImageToTemplate() {
  try {
    console.log('📄 Reading template file...');
    
    // Read the template with placeholders
    const content = fs.readFileSync('WINNER_LETTER_TEMPLATE_READY.docx', 'binary');
    const zip = new PizZip(content);
    
    console.log('✅ Template loaded');
    console.log('🖼️  Reading sc.png image...');
    
    // Read the image
    const imageData = fs.readFileSync('sc.png');
    console.log('✅ Image loaded:', imageData.length, 'bytes');
    
    // Add image to the document
    // We need to add it to the media folder and create relationships
    
    // Add image to media folder
    zip.file('word/media/image1.png', imageData);
    console.log('✅ Image added to document');
    
    // Get the document.xml.rels file
    let relsContent = zip.file('word/_rels/document.xml.rels').asText();
    
    // Add relationship for the image
    const imageRel = '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>';
    
    // Insert before the closing tag
    relsContent = relsContent.replace('</Relationships>', imageRel + '</Relationships>');
    zip.file('word/_rels/document.xml.rels', relsContent);
    
    console.log('✅ Image relationship added');
    
    // Get the header1.xml or create it
    let headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr/>
      <w:drawing>
        <wp:anchor distT="0" distB="0" distL="114300" distR="114300" simplePos="0" relativeHeight="251658240" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1">
          <wp:simplePos x="0" y="0"/>
          <wp:positionH relativeFrom="page">
            <wp:align>center</wp:align>
          </wp:positionH>
          <wp:positionV relativeFrom="page">
            <wp:align>center</wp:align>
          </wp:positionV>
          <wp:extent cx="5486400" cy="7315200"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:wrapNone/>
          <wp:docPr id="1" name="Background Image"/>
          <a:graphic>
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic>
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="sc.png"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="rId99"/>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="5486400" cy="7315200"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:anchor>
      </w:drawing>
    </w:r>
  </w:p>
</w:hdr>`;
    
    // Add header to document
    zip.file('word/header1.xml', headerXml);
    console.log('✅ Header with image created');
    
    // Create header relationship file
    const headerRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;
    
    zip.file('word/_rels/header1.xml.rels', headerRels);
    console.log('✅ Header relationships created');
    
    // Update document.xml.rels to include header
    let docRels = zip.file('word/_rels/document.xml.rels').asText();
    const headerRel = '<Relationship Id="rId100" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>';
    docRels = docRels.replace('</Relationships>', headerRel + '</Relationships>');
    zip.file('word/_rels/document.xml.rels', docRels);
    
    // Update document.xml to reference the header
    let docXml = zip.file('word/document.xml').asText();
    
    // Add header reference to section properties
    const headerRef = '<w:headerReference w:type="default" r:id="rId100"/>';
    
    // Find sectPr and add header reference
    if (docXml.includes('<w:sectPr>')) {
      docXml = docXml.replace('<w:sectPr>', '<w:sectPr>' + headerRef);
    } else {
      // Add sectPr if it doesn't exist
      docXml = docXml.replace('</w:body>', '<w:sectPr>' + headerRef + '</w:sectPr></w:body>');
    }
    
    zip.file('word/document.xml', docXml);
    console.log('✅ Document updated with header reference');
    
    // Generate the new document
    const buffer = zip.generate({ type: 'nodebuffer' });
    
    // Save the file
    fs.writeFileSync('የመሸኛ ደብደዳቤ winnerformat.docx', buffer);
    
    console.log('\n🎉 SUCCESS!');
    console.log('✅ Created: የመሸኛ ደብደዳቤ winnerformat.docx');
    console.log('✅ Image sc.png added as background');
    console.log('✅ All placeholders included');
    console.log('\n📊 File size:', buffer.length, 'bytes');
    console.log('\n🚀 The template is ready to use!');
    console.log('   The system will automatically use this template with your background.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Open WINNER_LETTER_TEMPLATE_READY.docx in WPS Office');
    console.log('   and manually add sc.png as background using Insert → Picture');
  }
}

addImageToTemplate();
