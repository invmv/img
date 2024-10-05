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
        header {
            background-color: #1f1f1f;
            padding: 16px;
            text-align: center;
        }
        header a {
            color: #ffffff;
            margin: 0 10px;
            text-decoration: none;
            font-size: 18px;
        }
        header a:hover {
            text-decoration: underline;
        }
        #gallery {
            padding: 16px;
        }
        .folder-section {
            margin-bottom: 48px;
        }
        .folder-section h2 {
            text-align: center;
            margin-bottom: 16px;
            color: #ffffff;
        }
        .folder-section .image-container {
            margin-bottom: 16px;
            break-inside: avoid;
        }
        .folder-section .image-container img {
            width: 100%;
            border-radius: 8px;
            transition: transform 0.2s;
        }
        .folder-section .image-container img:hover {
            transform: scale(1.05);
        }
        @media (min-width: 600px) {
            .folder-section {
                column-count: 2;
                column-gap: 16px;
            }
        }
        @media (min-width: 900px) {
            .folder-section {
                column-count: 3;
            }
        }
        @media (min-width: 1200px) {
            .folder-section {
                column-count: 4;
            }
        }
    </style>
</head>
<body>
    <header>
`;

fs.readdir(imagesDir, (err, folders) => {
    if (err) throw err;

    // 创建导航链接
    folders.forEach(folder => {
        htmlContent += `<a href="#${folder}">${folder}</a>`;
    });

    htmlContent += `
    </header>
    <div id="gallery">
`;

    let folderPromises = folders.map(folder => {
        return new Promise((resolve) => {
            const folderPath = path.join(imagesDir, folder);
            fs.readdir(folderPath, (err, files) => {
                if (err) return resolve();

                // 获取文件的修改时间并进行排序
                const sortedFiles = files
                    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file))
                    .map(file => {
                        const filePath = path.join(folderPath, file);
                        const stats = fs.statSync(filePath);
                        return { file, mtime: stats.mtime };
                    })
                    .sort((a, b) => b.mtime - a.mtime) // 按修改时间倒序排序
                    .map(item => item.file);

                if (sortedFiles.length > 0) {
                    // 生成该文件夹的图片墙
                    htmlContent += `<section class="folder-section" id="${folder}"><h2>${folder}</h2>`;
                    sortedFiles.forEach(file => {
                        htmlContent += `<div class="image-container"><img src="${cdn}/images/${folder}/${file}" alt="${file}"></div>`;
                    });
                    htmlContent += `</section>`;
                }

                resolve();
            });
        });
    });

    Promise.all(folderPromises).then(() => {
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
