const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

// парсер, который у нас уже был
//const xml2js = require('xml2js');

// парсеры, которые попробовал сегодня
//const xmlParser = require('xml-parser');
//const { DOMParser } = require('xmldom');
//const sax = require('sax');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.use(helmet());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "welcome" })
});

app.post("/upload_file", upload.array("filename"), uploadFiles);

// закомментил полностью предыдущий вариант загрузки и парсинга

// let nestedData = {};
// const returnParsedXMLNestedData = async (incomingNestedData) => {
//   await incomingNestedData;
//   setTimeout(async () => {
//     return nestedData = incomingNestedData;
//   }, 100);
// };

// async function uploadFiles(req, res) {
//   const files = req.files;

//   const fileName = files[0].originalFilename;
//   const fileSize = files[0].size;
//   const fileMimeType = files[0].mimetype
//   const filePath = files[0].path;

//   const parser = new xml2js.Parser({explicitArray : false});
//   const data = await fs.promises.readFile(filePath);

//   // if your XML looks like this:
//   //     <?xml version="1.0" encoding="utf-8"?>
//   //     <invoice importance="high" logged="true">
//   //       <recipientName>DarkNetStore</recipientName>
//   //       <date>2022/05/14 16:21:00</date>
//   //       <toAccount>40817826200005536362</toAccount>
//   //       <amount>10000</amount>
//   //       <comment>Bitcoin payment</comment>
//   //     </invoice>

//   // then you can parse it & show its data by keys like this:
//   // parser.parseString(data, async function (err, result) {
//   //   const thisInvoiceData = {
//   //     amount: result.invoice.amount,
//   //     comment: result.invoice.comment,
//   //     date: result.invoice.date,
//   //     recipientName: result.invoice.recipientName,
//   //     toAccount: result.invoice.toAccount
//   //   };

//   //   return new Promise(async (resolve, reject) => {
//   //     resolve(await returnParsedXMLNestedData(JSON.parse(JSON.stringify(thisInvoiceData))));
//   //   });
//   // });

//   const parsedData = parser.parseString(data, async function (err, result) {
//     setTimeout(async() => {
//       return await result;
//     }, 1000);
//   });

//   setTimeout(() => {
//     return res.json({
//       // nestedData: nestedData,
//       path: filePath,
//       filename: fileName,
//       size: fileSize,
//       mimdetype: fileMimeType,
//       fileData: parsedData
//     });
//   }, 3000);
// };


// новый вариант начинается тут

// переменная для количества узлов на верхнем уровне,
// чтобы можно было обновить значение и вывести в респонс
let nodes = 0;

async function uploadFiles(req, res) {
  // часть от этой строки
  const files = req.files;
  const fileName = files[0].originalFilename;
  const fileSize = files[0].size;
  const fileMimeType = files[0].mimetype
  const filePath = files[0].path;

  const xml = fs.readFileSync(filePath, 'utf-8');
  // до этой
  // можно не менять, а только закомментить/раскомментить попытки
  // с разными парсерами ниже

  // попытка с кастомным парсером
  let nodeCount = 0;

  function parseEntities(data) {
    return data.replace(/&([^;]+);/g, (match, entity) => {
      const entities = {
        'lol': 'lol',
      };
      return entities[entity] || match;
    });
  }

  function parseXML(data) {
    let inEntity = false;
    let entityData = '';

    for (const char of data) {
      if (char === '&') {
        inEntity = true;
      } else if (char === ';' && inEntity) {
        inEntity = false;
        const expandedEntity = parseEntities(entityData);
        entityData = '';
        parseXML(expandedEntity);
      } else if (inEntity) {
        entityData += char;
      }
    }
    
    if (!inEntity) {
      countNodes();
    }
  }

  parseXML(xml);

  nodes = nodeCount;

  console.log('Number of nodes:', nodeCount);

  function countNodes() {
    nodeCount++;
  }


  // попытка с sax

  // const parser = sax.parser(true);

  // let nodeCount = 0;

  // parser.onopentag = (node) => {
  //   if (node.name !== 'lolz') {
  //     nodeCount++;
  //   }
  // };

  // parser.write(xml).close();

  // console.log('Number of nodes:', nodeCount);


  // попытка с xmldom

  // try {
  //   const parser = new DOMParser();
  //   const xmlDoc = parser.parseFromString(xml, 'application/xml');

  //   const nodeCount = countNodes(xmlDoc);

  //   console.log('Number of nodes:', nodeCount);
  // } catch (err) {
  //   console.error('Error parsing XML:', err);
  // }

  // function countNodes(node) {
  //   let count = 1; // Count the root node itself

  //   if (node.childNodes) {
  //     for (const childNode of node.childNodes) {
  //       if (childNode.nodeType === 1) {
  //         count += countNodes(childNode);
  //       }
  //     }
  //   }

  //   return count;
  // }


  // попытка с xml-parser

  // try {
  //   const parsed = xmlParser(xml);

  //   const nodeCount = countNodes(parsed);

  //   nodes = nodeCount;
  //   console.log('Number of nodes:', nodeCount);
  // } catch (err) {
  //   console.error('Error parsing XML:', err);
  // }

  // function countNodes(node) {
  //   let count = 1;

  //   if (node.children) {
  //     for (const child of node.children) {
  //       count += countNodes(child);
  //     }
  //   }

  //   return count;
  // }


  // если этот респонс закомментить, тогда сервак точно зависнет, 
  // но это не совсем то, что нам нужно
  return res.json({
    nodes: nodes,
    path: filePath,
    filename: fileName,
    size: fileSize,
    mimdetype: fileMimeType, 
  });
};
 
app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
