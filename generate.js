const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'output');
const cdn = 'https://cdn.jsdelivr.net/gh/invmv/img';

// 生成主页面 HTML 内容
let indexHtmlContent = `
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
    </style>
</head>
<body>
    <header>
`;

fs.readdir(imagesDir, (err, folders) => {
    if (err) throw err;

    let folderPromises = folders.map(folder => {
        return new Promise((resolve) => {
            const folderPath = path.join(imagesDir, folder);
            fs.readdir(folderPath, (err, files) => {
                if (err) return resolve();

                // 生成每个文件夹的页面
                let folderHtmlContent = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folder} - 图库展示</title>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        #gallery {
            padding: 16px;
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
        @media (min-width: 600px) {
            #gallery {
                column-count: 2;
                column-gap: 16px;
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
    </style>
</head>
<body>
    <h2 style="text-align:center;">${folder} 图片展示</h2>
    <div id="gallery">
`;

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
                    sortedFiles.forEach(file => {
                        folderHtmlContent += `<div class="image-container"><img data-src="${cdn}/images/${folder}/${file}" alt="${file}" class="lazy-load"></div>`;
                    });
                }

                folderHtmlContent += `
    </div>
</body>
</html>`;

                // 写入该文件夹的 HTML 文件
                const folderHtmlFile = path.join(outputDir, `${folder}.html`);
                fs.writeFileSync(folderHtmlFile, folderHtmlContent);

                // 在主页面中添加导航链接
                indexHtmlContent += `<a href="${folder}.html">${folder}</a>`;
                resolve();
            });
        });
    });

    Promise.all(folderPromises).then(() => {
        indexHtmlContent += `
    </header>
</body>
</html>`;

        // 写入主页面 HTML 文件
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtmlContent);
        console.log('index.html 生成成功！');
    });
});
