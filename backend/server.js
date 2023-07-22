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

// let nestedData = {};
// const returnParsedXMLNestedData = async (incomingNestedData) => {
//   await incomingNestedData;
//   setTimeout(async () => {
//     return nestedData = incomingNestedData;
//   }, 100);
// };

async function uploadFiles(req, res) {
  const files = req.files;

  const fileName = files[0].originalFilename;
  const fileSize = files[0].size;
  const fileMimeType = files[0].mimetype
  const filePath = files[0].path;

  const parser = new xml2js.Parser({explicitArray : false});
  const data = await fs.promises.readFile(filePath);

  // if your XML looks like this:
  //     <?xml version="1.0" encoding="utf-8"?>
  //     <invoice importance="high" logged="true">
  //       <recipientName>DarkNetStore</recipientName>
  //       <date>2022/05/14 16:21:00</date>
  //       <toAccount>40817826200005536362</toAccount>
  //       <amount>10000</amount>
  //       <comment>Bitcoin payment</comment>
  //     </invoice>

  // then you can parse it & show its data by keys like this:
  // parser.parseString(data, async function (err, result) {
  //   const thisInvoiceData = {
  //     amount: result.invoice.amount,
  //     comment: result.invoice.comment,
  //     date: result.invoice.date,
  //     recipientName: result.invoice.recipientName,
  //     toAccount: result.invoice.toAccount
  //   };

  //   return new Promise(async (resolve, reject) => {
  //     resolve(await returnParsedXMLNestedData(JSON.parse(JSON.stringify(thisInvoiceData))));
  //   });
  // });

  const parsedData = parser.parseString(data, async function (err, result) {
    setTimeout(async() => {
      return await result;
    }, 1000);
  });

  setTimeout(() => {
    return res.json({
      // nestedData: nestedData,
      path: filePath,
      filename: fileName,
      size: fileSize,
      mimdetype: fileMimeType,
      fileData: parsedData
    });
  }, 3000);
};
 
app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
