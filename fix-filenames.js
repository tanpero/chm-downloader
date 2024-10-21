const fs = require('fs');
const path = require('path');

// 递归遍历目录
function traverseDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error reading file stats:', err);
                    return;
                }
                if (stats.isDirectory()) {
                    // 如果是目录，则递归调用
                    traverseDirectory(filePath);
                } else if (stats.isFile()) {
                    // 如果是文件，检查并可能重命名
                    checkAndRenameFile(filePath);
                }
            });
        });
    });
}

// 检查文件名并重命名
function checkAndRenameFile(filePath) {
    const fileName = path.basename(filePath);
    const regex = /(\S)-( )/; // 匹配非空白字符后跟“-”和空白字符
    if (regex.test(fileName)) {
        const newFileName = fileName.replace(regex, '$1 -$2');
        const newFilePath = path.join(path.dirname(filePath), newFileName);
        fs.rename(filePath, newFilePath, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                return;
            }
            console.log(`Renamed ${filePath} to ${newFilePath}`);
        });
    }
}

// 使用示例
const directoryPath = '_files'; // 替换为你的目录路径
traverseDirectory(directoryPath);