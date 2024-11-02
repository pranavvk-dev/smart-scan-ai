import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,Stepper,Step,StepLabel
} from '@mui/material';
import { Upload, FileText, History, Download, LayoutTemplate } from 'lucide-react';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

// Styled Components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.3s',
  boxShadow: theme.shadows[3],
  borderRadius: '16px',
  marginBottom: '20px',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const UploadCard = styled(StyledCard)({
  backgroundColor: '#e3f2fd',
});

const TemplateCard = styled(StyledCard)({
  backgroundColor: '#c8e6c9',
});

const ResultCard = styled(StyledCard)({
  backgroundColor: '#ffe0b2',
});

const PDFAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formattedData, setFormattedData] = useState(null); // Store formatted data

  const steps = [
    'Upload PDF',
    'Analyze Document',
    'Select Template',
    'View Results',
  ];

  const templates = [
    { id: 'tabular', name: 'Tabular View' },
    { id: 'points', name: 'Point-wise View' },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setCurrentStep(1);
      setSnackbarMessage('File uploaded successfully!');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Please upload a valid PDF file.');
      setSnackbarOpen(true);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setCurrentStep(2);
    try {
      // Simulate PDF text extraction
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockExtractedText = "Sample extracted text from PDF...\nData row one\nData row two";
      setExtractedText(mockExtractedText);

      const newAnalysis = {
        id: Date.now(),
        filename: selectedFile.name,
        date: new Date().toLocaleString(),
        text: mockExtractedText,
      };

      setAnalysisHistory((prev) => [...prev, newAnalysis]);
      setCurrentStep(3);
      setSnackbarMessage('Document analyzed successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error analyzing document:', error);
      setSnackbarMessage('Error analyzing document.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const processTemplate = () => {
    if (!selectedTemplate || !extractedText) return;

    let processed = null;
    if (selectedTemplate === 'tabular') {
      const lines = extractedText.split('\n');
      const tableData = [['Column 1', 'Column 2']]; // Header
      lines.forEach((line) => {
        // Assuming each line can be split into two columns for demonstration purposes
        const columns = line.split(' '); // Adjust split logic as needed
        if (columns.length > 1) {
          tableData.push(columns);
        } else {
          tableData.push([line, '']); // If there's no second column, add an empty string
        }
      });
      processed = { type: 'table', data: tableData };
    } else if (selectedTemplate === 'points') {
      // Splitting lines into points
      const pointsData = extractedText.split('\n').map(line => line.trim()).filter(line => line); // Remove empty lines
      processed = { type: 'points', data: pointsData };
    }

    setProcessedData(processed);
    setFormattedData(processed);
    setCurrentStep(4);
    setSnackbarMessage('Template processed successfully!');
    setSnackbarOpen(true);
  };

  const generateSummaryPDF = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();

    doc.text('Summary PDF', 10, 10);
    doc.text('Extracted Text:', 10, 20);
    doc.text(extractedText, 10, 30);
    doc.save('summary.pdf');

    setSnackbarMessage('Summary PDF generated successfully!');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const renderProcessedData = () => {
    if (!formattedData) return null;

    if (formattedData.type === 'table') {
      return (
        <Box>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {formattedData.data[0].map((header, index) => (
                  <th key={index} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedData.data.slice(1).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ border: '1px solid #ccc', padding: '8px' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      );
    } else if (formattedData.type === 'points') {
      return (
        <Box>
          <ul>
            {formattedData.data.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        Smart Scan AI
      </Typography>
      <Stepper activeStep={currentStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>


      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" width="100%" spacing={4} gap={3}>
        <Box flex={2} mr={{ md: 2 }} mb={{ xs: 2, md: 0 }}>
          <UploadCard>
            <CardHeader sx={{ backgroundColor: '#1976d2', color: '#fff', padding: '16px' }}>
              <Typography variant="h5" className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload PDF
              </Typography>
            </CardHeader>
            <CardContent sx={{ padding: '16px' }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                  Choose PDF File
                </label>
                {selectedFile && (
                  <Alert severity="info" icon={<FileText className="w-4 h-4" />} sx={{ width: '100%' }}>
                    <Typography>{selectedFile.name}</Typography>
                  </Alert>
                )}
                <Button
                  variant="contained"
                  color="success"
                  onClick={analyzeDocument}
                  disabled={!selectedFile || loading}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                    padding: '10px 20px',
                    fontSize: '16px',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Document'}
                </Button>
              </Box>
            </CardContent>
          </UploadCard>
        </Box>

        <Box flex={1}>
          <TemplateCard>
            <CardHeader sx={{ backgroundColor: '#388e3c', color: '#fff', padding: '16px' }}>
              <Typography variant="h5" className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5" />
                Select Template
              </Typography>
            </CardHeader>
            <CardContent sx={{ padding: '16px' }}>
              <Select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                fullWidth
                displayEmpty
                sx={{ marginBottom: 2 }}
              >
                <MenuItem value="" disabled>Select Template</MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="primary"
                onClick={processTemplate}
                disabled={!selectedTemplate || !extractedText}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  padding: '10px 20px',
                  fontSize: '16px',
                }}
              >
                Process Template
              </Button>
            </CardContent>
          </TemplateCard>
        </Box>
      </Box>

      <Box flex={1} width="100%">
        {formattedData && (
          <ResultCard>
            <CardHeader sx={{ backgroundColor: '#ff9800', color: '#fff', padding: '16px' }}>
              <Typography variant="h5" className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Analysis History
              </Typography>
            </CardHeader>
            <CardContent sx={{ padding: '16px' }}>
              {renderProcessedData()} {/* Render the processed data */}
              <Button
                variant="contained"
                color="info"
                onClick={generateSummaryPDF}
                disabled={!formattedData}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  padding: '10px 20px',
                  fontSize: '16px',
                }}
              >
                Generate Summary PDF
              </Button>
            </CardContent>
          </ResultCard>
        )}
      </Box>

      {/* Snackbar component */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PDFAnalyzer;
