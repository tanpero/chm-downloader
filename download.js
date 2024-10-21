const fs = require('fs');
const axios = require('axios');
const path = require('path');
const sleep = require('sleep');

let notFoundList = [];
let badGatewayList = [];
let errorList = [];

function getFileExtension(_url) {
    
    const url = "https:" + _url;
    // 使用URL对象解析URL
    const parsedUrl = new URL(url);
    // 获取URL的路径部分
    const path = parsedUrl.pathname;
    // 获取文件名
    const filename = path.split('/').pop();
    // 获取文件扩展名
    const extension = filename.split('.').pop();
    return ("." + extension) || ".pdf";
}

if (!fs.existsSync("files"))
  fs.mkdirSync("files");

// 读取JSON文件
fs.readFile('info.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  const items = JSON.parse(data);

  items.forEach(item => {
    const { name, url } = item;

    const filename = name.replace(/[:&]/g, "-").replace("?", "").replace(/[\\/]/g, " or ") + getFileExtension(url);
    const filePath = path.join('files', filename);

    if (fs.existsSync(filePath)) return;

    if (!url) return;

    axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    })
    .then(response => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      sleep.usleep(100000);

      writer.on('finish', () => {
        console.log("\n\n-----------\n\n");
        writer.close();
        console.log(`\n\nDownloaded and saved: ${filename}`);
      });

      writer.on('error', err => {
        console.error('\n\nError writing file:', err);
        errorList.push({ url, filename });
      });
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        notFoundList.push({ url, filename });
      } else if (error.response && error.response.status === 502) {
        badGatewayList.push({ url, filename });
      } else {
        console.error('\n\nError downloading file, when URL is ', url, "\n", error);
        errorList.push({ url, filename });
      }
    });
  });

  console.log("\n\n\n\n\n");
  console.log(errorList);
  console.log(notFoundList);
  console.log(badGatewayList);

  fs.writeFile('error.json', JSON.stringify(errorList, null, 2), (err) => {
    if (err) throw err;
    console.log('Error array has been written to error.json');
  });

  fs.writeFile('404.json', JSON.stringify(notFoundList, null, 2), (err) => {
    if (err) throw err;
    console.log('404 array has been written to 404.json');
  });

  fs.writeFile('502.json', JSON.stringify(badGatewayList, null, 2), (err) => {
    if (err) throw err;
    console.log('502 array has been written to 502.json');
  });
});
