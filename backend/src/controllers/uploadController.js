const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * POST /api/upload/extract-text
 * Expects a multipart/form-data request with a 'file' field.
 */
const extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' || 
      originalName.endsWith('.docx')
    ) {
      // mammoth specifically extracts from docx
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (mimeType === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the file. It might be empty or scanned.' });
    }

    res.json({ text: extractedText.trim() });
  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({ error: 'Failed to extract text from file: ' + error.message });
  }
};

module.exports = { extractText };
