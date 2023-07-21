const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs'),
xml2js = require('xml2js');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.use(helmet());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "welcome" })
});

app.post("/upload_file", upload.array("filename"), uploadFiles);

async function uploadFiles(req, res) {
  const files = req.files;

  const fileName = files[0].originalFilename;
  const fileSize = files[0].size;
  const fileMimeType = files[0].mimetype
  const filePath = files[0].path;

  const parser = new xml2js.Parser({explicitArray : false});
  const data = await fs.promises.readFile(filePath);

  const parsedData = parser.parseString(data, async function (err, result) {
    return await result;
  });
  
  return res.json({
    path: filePath,
    filename: fileName,
    size: fileSize,
    mimdetype: fileMimeType,
    fileData: parsedData
  });
}
 
app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
