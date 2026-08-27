const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

class TemplateEngine {
  /**
   * Generates a document from a docx template
   * @param {string} templatePath - The relative path to the template inside Format-Purchase-2026-27
   * @param {Object} data - The data to inject into the template
   * @returns {Promise<Buffer>} - The generated document buffer
   */
  static async generateDocument(templatePath, data) {
    // Resolve absolute path to the templates directory (at project root)
    const templatesDir = path.resolve(__dirname, '../../Format-Purchase-2026-27');
    const absolutePath = path.resolve(templatesDir, templatePath);

    // Security check: ensure path is within the templates directory
    if (!absolutePath.startsWith(templatesDir)) {
      throw new Error('Invalid template path. Cannot read outside of templates directory.');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Template not found at path: ${absolutePath}`);
    }

    // Load the docx file as binary content
    const content = fs.readFileSync(absolutePath, 'binary');

    // Unzip the content
    const zip = new PizZip(content);

    // Parse the template
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Error handling
      errorLogging: 'json'
    });

    // Provide mocked data as requested in plan, or merge with incoming query params
    const templateData = {
      vendor_name: "Demo Vendor Pvt Ltd",
      item_name: "Demo Item Equipment",
      total_cost: "5,00,000",
      indent_no: "IND/2026/001",
      date: new Date().toLocaleDateString('en-GB'),
      department: "Computer Engineering",
      ...data // Override with any specific data passed in
    };

    // Render the document
    doc.render(templateData);

    // Generate buffer
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      // compression: DEFLATE adds compression algorithm
      compression: 'DEFLATE',
    });

    return buf;
  }
}

module.exports = TemplateEngine;
