const axios = require('axios');
const FormData = require('form-data');

const express = require('express');
const htmlToDocx = require('html-to-docx');
const app = express();
const port = 3001;
const cors = require('cors'); // Import the cors package



app.use(cors()); // Enable CORS for all routes
app.use(express.json());
// ... other required imports and setup ...

app.post('/convert&upload', async (req, res) => {
   
  try {
    const docx = await htmlToDocx(req.body.content, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber:false,
    });

    // Instead of sending the file to the client, upload it to Google Drive
    const form = new FormData();
    const metadata = JSON.stringify({ name: req.body.fileName });
    form.append('metadata', metadata, { contentType: 'application/json' });
    form.append('file', Buffer.from(docx), { filename: `${req.body.fileName}.docx` });

    const response = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${req.body.authResponse}` // Make sure to use the correct access token
      }
    });

    // Send back the Google Drive file ID to the client
    res.status(200).send({ fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading to Google Drive:',  error);
    res.status(500).send({error:error});
  }
});


app.post('/convert-html-to-docx', async (req, res) => {
    try {
    
      const docx = await htmlToDocx(req.body.htmlContent, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        pageNumber: false,
      });
  
      res.setHeader('Content-Disposition', 'attachment; filename=download.docx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(Buffer.from(docx));
    } catch (error) {
      res.status(500).send('Error converting to DOCX');
    }
  });
  

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });