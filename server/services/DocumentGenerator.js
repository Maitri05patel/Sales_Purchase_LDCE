const doc12Indent = require('./generators/DOC-12-Indent');
const doc17NoteSheet = require('./generators/DOC-17-NoteSheet');

class DocumentGenerator {
  /**
   * Routes the document generation request to the appropriate generator.
   * @param {string} docId - The ID of the document to generate (e.g., 'DOC-12')
   * @param {string} entityId - The primary key of the entity in the database
   * @returns {Promise<Buffer>} - The generated document buffer
   */
  static async generateDocument(docId, entityId) {
    switch (docId) {
      case 'DOC-12':
        return await doc12Indent.generate(entityId);
      case 'DOC-17':
        return await doc17NoteSheet.generate(entityId);
      default:
        throw new Error(`Generator for document ID ${docId} is not implemented yet.`);
    }
  }
}

module.exports = DocumentGenerator;
