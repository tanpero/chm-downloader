const fs = require('fs');

// 读取JSON文件
fs.readFile('info.json', 'utf8', (err, data) => {
  if (err) {
    console.error("读取文件时出错:", err);
    return;
  }

  // 解析JSON数据
  let infoArray;
  try {
    infoArray = JSON.parse(data);
  } catch (parseError) {
    console.error("解析JSON时出错:", parseError);
    return;
  }

  // 根据name属性对数组进行排序
  infoArray.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  for (let i in infoArray) {
    infoArray[i].url = "https:" + infoArray[i].url;

    if (!("url" in infoArray[i])) {
      console.log("遗漏 URL：" + infoArray[i].name)
    }
  }

  // 将排序后的数组转换回JSON字符串
  const sortedData = JSON.stringify(infoArray, null, 2);

  // 写入JSON文件
  fs.writeFile('info.json', sortedData, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error("写入文件时出错:", writeErr);
    } else {
      console.log("文件已成功排序并写入");
    }
  });
});