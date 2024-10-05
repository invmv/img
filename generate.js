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
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
        }
        header {
            background-color: #1f1f1f;
            position: sticky;
            top: 0;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        header nav {
            display: flex;
            gap: 16px;
            border-bottom: 2px solid #3E3E3E;
        }
        header nav a {
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        header nav a:hover, header nav a:focus {
            background-color: #6200EE;
            color: #ffffff;
        }
        header nav a[aria-selected="true"] {
            color: #ffffff;
        }
        #gallery {
            padding: 16px;
            display: grid;
            gap: 24px;
        }
        .folder-section {
            margin-bottom: 48px;
            display: none;
        }
        .folder-section[aria-hidden="false"] {
            display: block;
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
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const tabs = document.querySelectorAll('nav a');
            const sections = document.querySelectorAll('.folder-section');

            tabs.forEach(tab => {
                tab.addEventListener('click', function(event) {
                    event.preventDefault();

                    // 移除所有选中状态
                    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                    sections.forEach(section => section.setAttribute('aria-hidden', 'true'));

                    // 设置当前选中的 tab 和 section
                    this.setAttribute('aria-selected', 'true');
                    const targetSection = document.querySelector(this.getAttribute('href'));
                    targetSection.setAttribute('aria-hidden', 'false');
                });
            });

            // 默认激活第一个 Tab 和 Section
            tabs[0].setAttribute('aria-selected', 'true');
            sections[0].setAttribute('aria-hidden', 'false');
        });
    </script>
</head>
<body>
    <header>
        <nav role="tablist">
`;

fs.readdir(imagesDir, (err, folders) => {
    if (err) throw err;

    // 创建导航链接，使用 tablist
    folders.forEach((folder, index) => {
        const isSelected = index === 0 ? 'true' : 'false';
        htmlContent += `<a href="#${folder}" role="tab" aria-selected="${isSelected}" aria-controls="${folder}">${folder}</a>`;
    });

    htmlContent += `
        </nav>
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
                    htmlContent += `<section class="folder-section" id="${folder}" role="tabpanel" aria-labelledby="${folder}" aria-hidden="true"><h2>${folder}</h2>`;
                    sortedFiles.forEach(file => {
                        htmlContent += `<div class="image-container"><img src="${cdn}/images/${folder}/${file}" title="${file}" alt="${file}"></div>`;
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
