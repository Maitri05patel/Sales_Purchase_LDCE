const express = require('express');
const router = express.Router();
const documentGenerator = require('../services/DocumentGenerator');
const TemplateEngine = require('../services/TemplateEngine');

// GET /api/documents/template
// Expects 'path' query parameter pointing to the .docx template file
router.get('/template', async (req, res, next) => {
  try {
    const templatePath = req.query.path;
    if (!templatePath) {
      return res.status(400).json({ success: false, error: 'path query parameter is required' });
    }

    // Pass arbitrary query parameters as data to the template engine
    const data = req.query;

    const buffer = await TemplateEngine.generateDocument(templatePath, data);

    const filename = templatePath.split('/').pop() || 'GeneratedDocument.docx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    console.error(`Template Generation Error:`, error);
    res.status(500).json({ success: false, error: 'Failed to generate template: ' + error.message });
  }
});

// GET /api/documents/:docId
// Expects entityId as a query parameter (e.g. ?entityId=1)
router.get('/:docId', async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { entityId } = req.query;

    if (!entityId) {
      return res.status(400).json({ success: false, error: 'entityId query parameter is required' });
    }

    const buffer = await documentGenerator.generateDocument(docId, entityId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${docId}-${entityId}.docx`);
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    console.error(`Document Generation Error [${req.params.docId}]:`, error);
    res.status(500).json({ success: false, error: 'Failed to generate document: ' + error.message });
  }
});

module.exports = router;
