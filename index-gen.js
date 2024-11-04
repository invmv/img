const fs = require('fs');
const path = require('path');

const categories = [
  {
    title: "MY trading 站长记录",
    links: [
      { text: "mytrading K线复盘", url: "mytrading.html" },
      { text: "Blog 图片库", url: "blog.html" }
    ]
  },
  {
    title: "Calendar 日历",
    links: [
      { text: "economic-calendar 经济日历", url: "ec.html" },
      { text: "investing英为财情 - 财报日历", url: "https://cn.investing.com/earnings-calendar/", target: "_blank" },
      { text: "TradingView - 财报日历", url: "https://cn.tradingview.com/markets/stocks-usa/earnings/", target: "_blank" }
    ]
  },
  {
    title: "Option 期权",
    links: [
      { text: "Option Strat", url: "https://optionstrat.com/optimize", target: "_blank" },
      { text: "Unusual Whales", url: "https://unusualwhales.com/live-options-flow/free", target: "_blank" }
    ]
  },
  {
    title: "Stock 股票",
    links: [
      { text: "BarChart", url: "https://www.barchart.com/", target: "_blank" },
      { text: "Unusual Whales", url: "https://unusualwhales.com/live-options-flow/free", target: "_blank" }
    ]
  },
  {
    title: "Price Action 价格行为学",
    links: [
      { text: "Al brooks Blog", url: "https://www.brookstradingcourse.com/price-action-trading-blog/", target: "_blank" },
      { text: "Al brooks 如何交易价格行为", url: "https://www.brookstradingcourse.com/how-to-trade-price-action-manual/", target: "_blank" },
      { text: "Al brooks Blog的图片 更新截至2024/10", url: "brookstradingcourse.html" },
      { text: "al brooks的视频课 - 网络资源仅供参考", url: "https://pa.invmy.us.kg/", target: "_blank" }
    ]
  },
  {
    title: "YouTuBer 油管博主",
    links: [
      { text: "Brooks Trading Course", url: "https://www.youtube.com/@BrooksTradingCourse", target: "_blank" },
      { text: "Price Action Rose", url: "https://www.youtube.com/@PriceActionRose", target: "_blank" },
      { text: "方方土 Price Action", url: "https://www.youtube.com/@LouiePriceAction", target: "_blank" },
      { text: "Trader Tom", url: "https://www.youtube.com/@TraderTom", target: "_blank" }
    ]
  },
  {
    title: "Tools 工具箱",
    links: [
      { text: "Tinypng 图片转换", url: "https://tinypng.com/", target: "_blank" },
      { text: "bilidown 视频下载", url: "https://zhouql.vip/bilibili/", target: "_blank" },
      { text: "方方土 Price Action", url: "https://www.youtube.com/@LouiePriceAction", target: "_blank" },
      { text: "Trader Tom", url: "https://www.youtube.com/@TraderTom", target: "_blank" }
    ]
  },
  {
    title: "Ai 生产力",
    links: [
      { text: "OpenAi chatgpt", url: "https://chatgpt.com/", target: "_blank" },
      { text: "OpenAi chatgpt - mirror", url: "https://new.oaifree.com/", target: "_blank" },
      { text: "suno 歌曲生成", url: "https://suno.com/", target: "_blank" },
      { text: "Github - Free chatgpt", url: "https://github.com/LiLittleCat/awesome-free-chatgpt", target: "_blank" }
    ]
  }
];

function generateHTML() {
  const categorySections = categories.map(category => {
    const links = category.links.map(link => `
      <div class="link-item">
        <a href="${link.url}"${link.target ? ` target="${link.target}"` : ""}>${link.text}</a>
      </div>
    `).join('');

    return `
      <section>
        <h2 class="category-title">${category.title}</h2>
        <div class="link-section">
          ${links}
        </div>
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
  <title>trading Tools 交易导航页</title>
  <style>
    /* 样式内容 */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    :root {
      --bg-color: #ffffff;
      --text-color: #000000;
      --link-color: #1a73e8;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #121212;
        --text-color: #ffffff;
        --link-color: #348bce;
      }
    }

    .container {
      max-width: 800px;
      padding: 20px;
      width: 100%;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .announcement {
      background-color: var(--link-color);
      color: #fff;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }

    .category-title {
      font-size: 1.5em;
      color: var(--link-color);
      margin: 20px 0 10px;
    }

    .link-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    @media (max-width: 600px) {
      .link-section {
        grid-template-columns: 1fr;
      }
    }

    .link-item {
      background-color: var(--bg-color);
      padding: 15px;
      border: 1px solid var(--border-color, var(--link-color));
      border-radius: 5px;
      text-align: center;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .link-item a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: bold;
    }

    .link-item a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>invest My Trading</h1>
    </header>
    <section class="announcement">
      <p>资源来源网络 侵权联系删除</p>
      <p>作为交易员的交易导航</p>
    </section>
    ${categorySections}
  </div>
</body>
</html>`;
}

// 保存 HTML 文件到 output 文件夹
function saveHTML() {
    const outputDir = path.join(__dirname, 'output');
    const outputFile = path.join(outputDir, 'index.html');
  
    // 检查 output 文件夹是否存在，不存在则创建
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  
    // 写入文件
    fs.writeFileSync(outputFile, generateHTML());
    console.log('HTML 文件已生成并保存在 output 文件夹中:', outputFile);
  }
  
// 执行保存操作
saveHTML();