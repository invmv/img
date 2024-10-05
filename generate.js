const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'output');
const outputFile = path.join(outputDir, 'index.html');
const cdn = 'https://cdn.jsdelivr.net/gh/invmv/img';

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
            margin: 0;
            padding: 0;
        }
        #gallery {
            column-count: 1;
            column-gap: 16px;
            padding: 16px;
        }
        @media (min-width: 600px) {
            #gallery {
                column-count: 2;
            }
        }
        @media (min-width: 900px) {
            #gallery {
                column-count: 3;
            }
        }
        @media (min-width: 1200px) {
            #gallery {
                column-count: 4;
            }
        }
        .image-container {
            margin-bottom: 16px;
            break-inside: avoid;
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
                    if (/\.(jpg|jpeg|png|gif|webp)$/.test(file)) {
                        htmlContent += `<div class="image-container"><img src="${cdn}/images/${folder}/${file}" alt="${file}"></div>`;
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
