const fs = require('fs');   
const path = require('path');

const repository = process.env.GITHUB_REPOSITORY;
const cdn = `https://cdn.jsdelivr.net/gh/${repository}`;
const imagesDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'output');

function getImages(folderPath) {
    const files = fs.readdirSync(folderPath);
    return files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file))
        .map(file => {
            const tags = file.split('-').slice(0, -1);
            return { name: file, tags };
        });
}

function generateHTML(images, folderName) {
    const tagCloud = {};
    images.forEach(img => {
        img.tags.forEach(tag => {
            tagCloud[tag] = (tagCloud[tag] || 0) + 1;
        });
    });
    const sortedTags = Object.entries(tagCloud).sort((a, b) => b[1] - a[1]);

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName} 图片墙</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: Arial, sans-serif;
        }

        h1 {
            margin-bottom: 20px;
        }

        .tag-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
        }

        .tag-cloud a {
            padding: 5px 10px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s, color 0.3s;
        }

        .tag-cloud a:hover {
            opacity: 0.8;
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            max-width: 90%;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.3s;
        }

        .gallery-item:hover {
            transform: scale(1.05);
        }

        .gallery-item img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }

        #lightbox {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        #lightbox img {
            max-width: 90%;
            max-height: 90%;
            transform-origin: center center;
            transition: transform 0.3s;
        }

        .back-button {
            display: inline-block;
            margin-bottom: 20px;
            padding: 10px 20px;
            background-color: #333;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .back-button:hover {
            background-color: #555;
        }
    </style>
</head>
<body>
    <a href="index.html" class="back-button">返回主页</a>
    <h1>${folderName} 图片墙</h1>
    <div id="gallery" class="gallery">
        ${images.map(image => `
            <div class="gallery-item" onclick="openLightbox(event)">
                <img src="${cdn}/images/${folderName}/${image.name}" alt="${image.name}">
            </div>
        `).join('')}
    </div>

    <div id="lightbox" onclick="closeLightbox()">
        <img id="lightbox-image" src="" alt="Lightbox Image" draggable="false">
    </div>

    <script>
        let scale = 1, translateX = 0, translateY = 0;

        function openLightbox(event) {
            const lightbox = document.getElementById('lightbox');
            const lightboxImage = document.getElementById('lightbox-image');
            const img = event.currentTarget.querySelector('img');
            lightboxImage.src = img.src;
            lightbox.style.display = 'flex';
            resetTransform();
        }

        function closeLightbox() {
            document.getElementById('lightbox').style.display = 'none';
        }

        function resetTransform() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        }

        function updateTransform() {
            const lightboxImage = document.getElementById('lightbox-image');
            lightboxImage.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
        }

        document.getElementById('lightbox-image').addEventListener('wheel', function(event) {
            event.preventDefault();
            const zoomAmount = event.deltaY < 0 ? 0.1 : -0.1;
            scale = Math.min(Math.max(.5, scale + zoomAmount), 3);
            updateTransform();
        });

        let isDragging = false, startX, startY;
        const lightbox = document.getElementById('lightbox');
        lightbox.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            lightbox.style.cursor = 'grabbing';
        });

        lightbox.addEventListener('mousemove', (event) => {
            if (isDragging) {
                translateX = event.clientX - startX;
                translateY = event.clientY - startY;
                updateTransform();
            }
        });

        lightbox.addEventListener('mouseup', () => {
            isDragging = false;
            lightbox.style.cursor = 'default';
        });

        lightbox.addEventListener('mouseleave', () => {
            isDragging = false;
            lightbox.style.cursor = 'default';
        });
    </script>
</body>
</html>`;
}

function generateHTMLForAllFolders() {
    fs.mkdirSync(outputDir, { recursive: true });
    const folders = fs.readdirSync(imagesDir).filter(folder => fs.statSync(path.join(imagesDir, folder)).isDirectory());

    folders.forEach(folder => {
        const folderPath = path.join(imagesDir, folder);
        const images = getImages(folderPath);
        const htmlContent = generateHTML(images, folder);
        const outputFile = path.join(outputDir, `${folder}.html`);
        fs.writeFileSync(outputFile, htmlContent);
        console.log('HTML 文件生成完成:', outputFile);
    });
}

generateHTMLForAllFolders();
