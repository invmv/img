const fs = require('fs');   
const path = require('path');

const repository = process.env.GITHUB_REPOSITORY;
const cdn = `https://cdn.jsdelivr.net/gh/${repository}`;
// 读取图片文件夹
const imagesDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'output');

// 获取指定文件夹下的所有图片及其标签
function getImages(folderPath) {
    const files = fs.readdirSync(folderPath);
    return files
        .filter(file => /\.(jpg|jpeg|png|gif|webp|avif)$/.test(file))
        .map(file => {
            const tags = file.split('-').slice(0, -1);
            return { name: file, tags };
        });
}

// 生成 HTML 内容
function generateHTML(images, folderName) {
    // 生成标签云
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
            /* 通用样式 */
            body {
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
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

            .tag-cloud a.selected {
                color: #ffffff;
            }

            .gallery {
                column-gap: 15px; 
                max-width: 90%;
                margin: 0 auto;
            }
            /* 响应式瀑布流 */
            @media (min-width: 600px) {
                .gallery {
                    column-count: 2; /* 平板设备 2 列 */
                }
            }

            @media (min-width: 900px) {
                .gallery {
                    column-count: 3; /* 小型电脑 3 列 */
                }
            }

            @media (min-width: 1200px) {
                .gallery {
                    column-count: 4; /* 大型电脑 4 列 */
                }
            }
            .gallery-item {
                margin-bottom: 15px; /* 控制项之间的垂直间距 */
                break-inside: avoid; /* 防止元素拆分到不同列 */
                position: relative;
                overflow: hidden;
                border-radius: 8px;
                transition: transform 0.3s;
                cursor: pointer;
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

            /* 懒加载 */
            .lazy {
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }

            .lazy-loaded {
                opacity: 1;
            }

            /* 灯箱样式 */
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

            /* 明亮模式样式 */
            @media (prefers-color-scheme: light) {
                body {
                    background-color: #f5f5f5;
                    color: #333;
                }

                h1 {
                    color: #333;
                }

                .tag-cloud a {
                    color: #333;
                    background-color: #e0e0e0;
                }

                .tag-cloud a.selected {
                    background-color: #6200ea;
                    color: #ffffff;
                }

                .gallery-item {
                    background-color: #f5f5f5;
                }
            }

            /* 暗黑模式样式 */
            @media (prefers-color-scheme: dark) {
                body {
                    background-color: #121212;
                    color: #ffffff;
                }

                h1 {
                    color: #f5f5f5;
                }

                .tag-cloud a {
                    color: #b0bec5;
                    background-color: #333;
                }

                .tag-cloud a.selected {
                    background-color: #6200ea;
                    color: #ffffff;
                }

                .gallery-item {
                    background-color: #333;
                }
            }
            /* 返回主页按钮样式 */
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
            
            /* 鼠标悬停时的按钮效果 */
            .back-button:hover {
                background-color: #555;
            }
        </style>
</head>
<body>
    <!-- 返回主页按钮 -->
    <a href="index.html" class="back-button">返回主页</a>
    <br>
    <h1>${folderName} 图片墙</h1>
    <div id="tag-cloud" class="tag-cloud">
        ${sortedTags.map(([tag, count]) => `
            <a href="#" onclick="selectTag('${tag}', this)">${tag} (${count})</a>
        `).join('')}
    </div>
    <div id="gallery" class="gallery">
        ${images.map(image => `
            <div class="gallery-item" data-tags="${image.tags.join(' ')}" onclick="openLightbox(event)">
                <img data-src="${cdn}/images/${folderName}/${image.name}" alt="${image.name}" title="${image.name}" class="lazy">
            </div>
        `).join('')}
    </div>
    <div id="lightbox" onclick="closeLightbox()">
        <img id="lightbox-image" src="" alt="Lightbox Image" draggable="false">
    </div>

    <script>
        let selectedTags = [];
        let scale = 1;
        let translateX = 0;
        let translateY = 0;

        document.addEventListener("DOMContentLoaded", function() {
            lazyLoadImages();
        });

        function lazyLoadImages() {
            const lazyImages = document.querySelectorAll('.lazy');
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('lazy-loaded');
                        observer.unobserve(img);
                    }
                });
            }, { root: null, rootMargin: "0px", threshold: 0.1 });

            lazyImages.forEach(image => observer.observe(image));
        }

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


        // 添加鼠标滚轮事件以缩放图像
        document.getElementById('lightbox-image').addEventListener('wheel', function(event) {
            event.preventDefault(); // 防止滚动页面
            const zoomAmount = event.deltaY < 0 ? 0.1 : -0.1;
            scale = Math.min(Math.max(.5, scale + zoomAmount), 3); // 限制缩放范围
            updateTransform();
        });

        // 添加拖动功能
        let isDragging = false;
        let startX, startY;

        const lightbox = document.getElementById('lightbox');
        lightbox.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            lightbox.style.cursor = 'grabbing'; // 更改鼠标样式
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
            lightbox.style.cursor = 'grab'; // 恢复鼠标样式
        });

        lightbox.addEventListener('mouseleave', () => {
            isDragging = false;
            lightbox.style.cursor = 'grab'; // 恢复鼠标样式
        });

        function selectTag(tag, element) {
            const index = selectedTags.indexOf(tag);
            if (index === -1) {
                selectedTags.push(tag);
                element.classList.add('selected');
            } else {
                selectedTags.splice(index, 1);
                element.classList.remove('selected');
            }

            filterImages();
            updateTagCloud();
        }

        function filterImages() {
            const galleryItems = document.querySelectorAll('.gallery-item');
            let hasVisibleImages = false;

            galleryItems.forEach(item => {
                const itemTags = item.dataset.tags.split(' ');
                const matches = selectedTags.every(tag => itemTags.includes(tag));

                if (matches) {
                    item.style.visibility = 'visible';
                    item.style.position = 'static';
                    hasVisibleImages = true;
                } else {
                    item.style.visibility = 'hidden';
                    item.style.position = 'absolute';
                }
            });

            document.getElementById('gallery').style.display = hasVisibleImages ? 'block' : 'none';
        }

        function updateTagCloud() {
            const remainingTags = new Map(); // 使用 Map 来存储标签及其计数
            const galleryItems = document.querySelectorAll('.gallery-item');

            // 统计每个标签的出现次数
            galleryItems.forEach(item => {
                const itemTags = item.dataset.tags.split(' ');
                if (selectedTags.every(tag => itemTags.includes(tag))) {
                    itemTags.forEach(tag => {
                        remainingTags.set(tag, (remainingTags.get(tag) || 0) + 1); // 计数
                    });
                }
            });

            // 对剩余标签按数量排序，并过滤掉数量为 1 的标签
            const sortedRemainingTags = Array.from(remainingTags)
                .filter(([tag, count]) => count > 1) // 过滤掉计数为 1 的标签
                .sort((a, b) => b[1] - a[1]);

            const tagCloud = document.getElementById('tag-cloud');
            tagCloud.innerHTML = sortedRemainingTags.map(([tag, count]) =>
                \`<a href="#" onclick="selectTag('\${tag}', this)" class="\${selectedTags.includes(tag) ? 'selected' : ''}">\${tag} (\${count})</a>\`
            ).join(' ');
        }
    </script>
</body>
</html>
    `;
}

// 遍历 images 文件夹中的子文件夹，并生成 HTML 文件
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
