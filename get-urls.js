const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('sleep');
const fs = require('fs');

// 用于存储所有页面的信息
const infoArray = [];

// 用于处理和获取完整的URL
const getFullUrl = (relativeUrl) => {
  const baseUrl = 'https://www.computerhistory.org/collections/' + relativeUrl.replace("../", "");
  return baseUrl;
};

// 获取页面并解析
const fetchAndParsePage = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // 使用选择器获取文件标题
    const titleSelector = "#biginfo > div:nth-child(1) > span";
    const titleElement = $(titleSelector);
    const title = titleElement.text().trim();

    // 使用选择器获取文件描述
    const descriptionSelector = "#content > div:nth-child(3) > div:nth-child(1)";
    const descriptionElement = $(descriptionSelector);
    const description = descriptionElement.text().trim();

    // 获取href属性
    const urlSelector = "#content > div:nth-child(4) > div.mediarow.mediaDocument > ul > li > a";
    
    const urlElement = $(urlSelector);
    const href = urlElement.attr('href');

    // 创建对象并添加到数组
    const infoObject = {
      name: title,
      description: description.replace(/\n/g, '\\n'), // 替换换行符以便于JSON格式存储
      url: href,
      catalog: url.replace(/http.*catalog\//, ""),
    };
    infoArray.push(infoObject);

    console.log('Found:', infoObject);

  } catch (error) {
    console.error(`Error fetching page ${url}: ${error}`);
  }
};

// 批量获取页面并解析
const fetchAndParsePages = async (startPage, endPage) => {
  for (let n = startPage; n <= endPage; n++) {
    try {
      // 构造URL
      const url = `https://www.computerhistory.org/collections/oralhistories/?s=all&page=${n}`;
      console.log(`Fetching page: ${url}`);

      // 发送HTTP GET请求
      const response = await axios.get(url);
      const html = response.data;

      // 使用cheerio加载HTML
      const $ = cheerio.load(html);

      // 从2到21的m值
      for (let m = 2; m <= 21; m++) {
        // 使用选择器获取元素
        const selector = `#content > div:nth-child(3) > div > div:nth-child(${m}) > div.objtext.col-md-9.col-sm-9 > .objtitle > a`;
        const element = $(selector);

        // 如果元素存在，获取href属性
        if (element.length > 0) {
          const relativeHref = element.attr('href');
          if (relativeHref) {
            // 处理并获取完整的URL
            const fullUrl = getFullUrl(relativeHref);
            console.log(`\n\n第 ${n} 页，第 ${m} 项：\n`)
            console.log(`Processing full URL: ${fullUrl}`);

            // 等待0.1秒
            sleep.usleep(100000);

            // 获取并解析目标页面
            await fetchAndParsePage(fullUrl);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching page ${n}: ${error}`);
    }
    
    // 写入info.json文件
    fs.writeFile('info.json', JSON.stringify(infoArray, null, 2), (err) => {
      if (err) throw err;
      console.log('Info array has been written to info.json');
    });
  }

};

// 调用函数，从第1页到第81页
fetchAndParsePages(1, 81);