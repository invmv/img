const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'output');
const outputFile = path.join(outputDir, 'index.html');

// 生成 HTML 内容
let htmlContent = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图库展示</title>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: Arial, sans-serif;
        }
        #gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 16px;
        }
        .image-container {
            position: relative;
            width: calc(33.333% - 32px);
        }
        .image-container img {
            width: 100%;
            border-radius: 8px;
            transition: transform 0.2s;
        }
        .image-container img:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div id="gallery">`;

fs.readdir(imagesDir, (err, folders) => {
    if (err) throw err;

    let imagePromises = folders.map(folder => {
        return new Promise((resolve) => {
            const folderPath = path.join(imagesDir, folder);
            fs.readdir(folderPath, (err, files) => {
                if (err) return resolve();
                files.forEach(file => {
                    if (/\.(jpg|jpeg|png|gif)$/.test(file)) {
                        htmlContent += `<div class="image-container"><img src="images/${folder}/${file}" alt="${file}"></div>`;
                    }
                });
                resolve();
            });
        });
    });

    Promise.all(imagePromises).then(() => {
        htmlContent += `
            </div>
        </body>
        </html>`;

        // 写入 HTML 文件
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputFile, htmlContent);
        console.log('index.html 生成成功！');
    });
});
