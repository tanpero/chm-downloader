const fs = require('fs');
const axios = require('axios');
const path = require('path');
const sleep = require('sleep');

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

// 读取JSON文件
fs.readFile('info.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // 解析JSON数据
  const items = JSON.parse(data);

  // 遍历数组中的每个元素
  items.forEach(item => {
    const { name, url } = item;


    // 构造文件名和文件路径
    const filename = name.replace(/:/g, " -") + getFileExtension(url);
    const filePath = path.join('files', filename);

    // 使用axios下载文件
    axios({
      method: 'get',
      url: "https:" + url,
      responseType: 'stream'
    })
    .then(response => {
      // 创建并写入文件
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // 当文件写入完成时
      writer.on('finish', () => {
        writer.close();
        console.log(`\n\nDownloaded and saved: ${filename}`);
      });

      // 监听可能的错误
      writer.on('error', err => {
        console.error('\n\nError writing file:', err);
        errorList.push(url)
      });
    })
    .catch(error => {
      console.error('\n\nError downloading file:', error);
      errorList.push(url)
    });
  });

  console.log("\n\n\n\n\n");
  console.log(errorList);


  fs.writeFile('error.json', JSON.stringify(errorList, null, 2), (err) => {
    if (err) throw err;
    console.log('Info array has been written to info.json');
  });

});


