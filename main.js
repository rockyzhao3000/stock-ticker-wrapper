/*
  Stock Ticker Wrapper v1.0.3
  修复日志：
  1. 🛡️ 区域保护：SmartWrap 自动跳过文档顶部的 YAML Properties (Frontmatter) 区域。
  2. 📂 路径变更：新文件自动存入 "经济/Stocks/" 目录
  3. 💡 友好提示：精确显示成功修改的股票代码数量。
  4. 🧹 核心保持：Finviz 行业补全、字符清洗、内置一些数据。
  5. 🚫 边界过滤：跳过被 - _ * # 包围的代码（如 **AAPL** 或 VAR_TSLA_KEY）。
*/
const obsidian = require("obsidian");

// ================= 1. 黑名单 =================
const IGNORED_TICKERS = new Set([
    "AI", "CEO", "CTO", "CFO", "UFO", "DNA", "MBA", "GDP", "CPI", "IPO",
    "USA", "UK", "CNY", "USD", "EUR", "JPY",
    "IT", "PC", "TV", "VR", "AR", "ID", "IP", "OS", "HR", "PR",
    "AM", "PM", "TM", "ASX", "EU", "SA", "SOI", "ST", "CC", "PMI", "AP", "MEG", "AMC",
    "HBM", "HCC", "FSD", "XYZ", "PPT",
    "ON", "OR", "IF", "IS", "AT", "BY", "HE", "HI", "NO", "WE", "SO", "DO", "GO", "TO", "UP", "ME", "MY", "ALL", "AND",
    "HBM", "SSD", "HDD", "RAM", "ROM", "CPU", "GPU", "NPU", "TPU", "MCU", "DSP",
    "USB", "HDMI", "VGA", "DVI", "LED", "LCD", "PCB", "DDR", "DRAM", "NAND", "FLASH",
    "API", "APP", "GUI", "CLI", "SDK", "IDE", "IOT", "AWS", "SAAS", "PAAS", "IAAS",
    "PDF", "PNG", "JPG", "GIF", "SVG", "KEY", "MAC", "PIN", "SIM", "NET", "ICE", "CIA", "CDC", "GPS", "CLIK", "WEB"
]);

// ================= 2. 默认保底数据 =================
const DEFAULT_DATA = {
    lastUpdated: 0,
    tickers: [
        { symbol: "TSLA", name: "Tesla Inc.", market: "NASDAQ", sector: "Consumer Cyclical", industry: "Auto Manufacturers" },
        { symbol: "NVDA", name: "NVIDIA Corp.", market: "NASDAQ", sector: "Technology", industry: "Semiconductors" },
        { symbol: "INTC", name: "Intel Corporation", market: "NASDAQ", sector: "Technology", industry: "Semiconductors" },
        { symbol: "AAPL", name: "Apple Inc.", market: "NASDAQ", sector: "Technology", industry: "Consumer Electronics" },
        { symbol: "MSFT", name: "Microsoft Corp.", market: "NASDAQ", sector: "Technology", industry: "Software - Infrastructure" },
        { symbol: "CRML", name: "Critical Metals Corp.", market: "NASDAQ", sector: "Basic Materials", industry: "Other Industrial Metals & Mining" },
        { symbol: "LAC", name: "Lithium Americas", market: "NYSE", sector: "Basic Materials", industry: "Other Industrial Metals & Mining" },
        { symbol: "ILU", name: "Iluka Resources Limited", market: "ASX", sector: "Basic Materials", industry: "Other Industrial Metals & Mining" },
        { symbol: "VUL", name: "Vulcan Energy Resources Limited", market: "ASX", sector: "Materials", industry: "Other Industrial Metals & Mining" },
        { symbol: "LYC", name: "Lynas Rare Earths Ltd.", market: "ASX", sector: "Basic Materials", industry: "Rare Earth Elements" },
        { symbol: "LTBR", name: "Lightbridge Corp.", market: "NASDAQ", sector: "Utilities", industry: "Independent Power Producers" },
        { symbol: "GOOGL", name: "Alphabet Inc.", market: "NASDAQ", sector: "Communication Services", industry: "Internet Content & Information" },
        { symbol: "PLTR", name: "Palantir Technologies Inc.", market: "NYSE", sector: "Technology", industry: "Software—Infrastructure" }
    ]
};

// ================= 3. 数据源 =================
const DATA_SOURCES = [
    {
        id: "dumbstock",
        url: "https://dumbstockapi.com/stock?format=json&exchanges=NYSE,NASDAQ,AMEX",
        type: "dumbstock"
    },
    {
        id: "sec",
        url: "https://www.sec.gov/files/company_tickers.json",
        type: "sec"
    }
];

// ================= 4. 样式注入 (仅手型) =================
function injectCustomStyles() {
    const cssId = "stock-ticker-custom-css";
    const existing = document.getElementById(cssId);
    if (existing) existing.remove();

    const style = document.createElement("style");
    style.id = cssId;
    style.textContent = `
        .stock-ticker {
            cursor: pointer !important;
            transition: opacity 0.2s;
        }
        .stock-ticker:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// 辅助函数：清洗 HTML 实体
function cleanText(str) {
    if (!str) return "Unknown";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

module.exports = class StockTickerWrapper extends obsidian.Plugin {

    async onload() {
        console.log("Stock Ticker: v0.9.4 初始化...");
        this.tickerMap = new Map();

        injectCustomStyles();
        await this.loadLocalData();

        this.addCommand({
            id: 'wrap-tickers-smart',
            name: 'Smart Format Stock Tickers',
            editorCallback: (editor, view) => this.smartWrap(editor, view)
        });

        this.addCommand({
            id: 'force-update-tickers',
            name: 'Force Update Stock Data Source',
            callback: () => this.updateAllTickers(true)
        });

        this.addCommand({
            id: 'update-current-metadata',
            name: 'Update Metadata for Current Stock Page',
            callback: () => this.updateCurrentPageMetadata()
        });

        this.registerHover();

        if (this.tickerMap.size < 100) {
            this.updateAllTickers(true);
        } else {
            setTimeout(() => this.updateAllTickers(false), 5000);
        }

        new obsidian.Notice("Stock Ticker v0.9.4 已加载");
    }

    async loadLocalData() {
        const loaded = await this.loadData();
        DEFAULT_DATA.tickers.forEach(t => this.tickerMap.set(t.symbol, t));

        if (loaded && loaded.tickers) {
            loaded.tickers.forEach(t => {
                const existing = this.tickerMap.get(t.symbol);
                if (existing) {
                    if ((!t.sector || t.sector === "Unknown") && existing.sector !== "Unknown") {
                        t.sector = existing.sector;
                        t.industry = existing.industry;
                    }
                }
                this.tickerMap.set(t.symbol, t);
            });
        }
    }

    async saveDataInternal() {
        const tickerArray = Array.from(this.tickerMap.values());
        await this.saveData({ lastUpdated: Date.now(), tickers: tickerArray });
    }

    // ================= 数据源更新 =================
    async updateAllTickers(showNotice = false) {
        if (showNotice) new obsidian.Notice("Stock Ticker: 更新数据中...");
        // 1. DumbStock
        try {
            const res1 = await obsidian.requestUrl({ url: DATA_SOURCES[0].url });
            if (res1.status === 200) {
                res1.json.forEach(item => {
                    if (item.ticker && item.name) {
                        const cleanSymbol = item.ticker.replace(/[\^.].*/, "");
                        this.tickerMap.set(cleanSymbol, {
                            symbol: cleanSymbol,
                            name: item.name,
                            market: item.exchange || "US",
                            sector: cleanText(item.sector),
                            industry: cleanText(item.industry)
                        });
                    }
                });
            }
        } catch (e) { console.warn("DumbStock 失败", e); }
        // 2. SEC
        try {
            const res2 = await obsidian.requestUrl({
                url: DATA_SOURCES[1].url,
                headers: { "User-Agent": "ObsidianStockTicker/1.0" }
            });
            if (res2.status === 200) {
                const secData = res2.json;
                Object.values(secData).forEach(item => {
                    const symbol = item.ticker;
                    const name = item.title;
                    if (symbol && name) {
                        if (!this.tickerMap.has(symbol)) {
                            this.tickerMap.set(symbol, {
                                symbol: symbol, name: name, market: "US", sector: "Unknown", industry: "Unknown"
                            });
                        }
                    }
                });
            }
        } catch (e) { console.warn("SEC 失败", e); }

        if (this.tickerMap.size > 2000) {
            await this.saveDataInternal();
            if (showNotice) new obsidian.Notice(`更新成功! 库容量: ${this.tickerMap.size}`);
        }
    }

    // ================= Finviz 抓取 =================
    async fetchMetadataFromFinviz(symbol) {
        try {
            const url = `https://finviz.com/quote.ashx?t=${symbol}`;
            const res = await obsidian.requestUrl({
                url: url,
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            if (res.status === 200) {
                const html = res.text;
                const secMatch = html.match(/f=sec_[^>]+>([^<]+)<\/a>/);
                const indMatch = html.match(/f=ind_[^>]+>([^<]+)<\/a>/);
                if (secMatch && indMatch) {
                    return { sector: cleanText(secMatch[1]), industry: cleanText(indMatch[1]) };
                }
            }
        } catch (e) { console.warn(`Finviz fetch failed for ${symbol}`, e); }
        return null;
    }

    // ================= 页面创建 (新路径: 经济/Stocks/) =================
    async ensureStockPage(info) {
        // 定义新路径
        const rootFolder = "经济";
        const subFolder = "Stocks";
        const targetFolder = `${rootFolder}/${subFolder}`;

        // 递归创建文件夹
        if (!this.app.vault.getAbstractFileByPath(rootFolder)) {
            await this.app.vault.createFolder(rootFolder);
        }
        if (!this.app.vault.getAbstractFileByPath(targetFolder)) {
            await this.app.vault.createFolder(targetFolder);
        }

        const filePath = `${targetFolder}/${info.symbol}.md`;
        let file = this.app.vault.getAbstractFileByPath(filePath);

        if (!file) {
            new obsidian.Notice(`正在获取 ${info.symbol} 详情...`);
            if (!info.sector || info.sector === "Unknown") {
                const metadata = await this.fetchMetadataFromFinviz(info.symbol);
                if (metadata) {
                    info.sector = metadata.sector;
                    info.industry = metadata.industry;
                    this.tickerMap.set(info.symbol, info);
                    this.saveDataInternal();
                }
            }

            const content = `---
ticker: ${info.symbol}
name: ${info.name}
market: ${info.market}
sector: ${info.sector}
industry: ${info.industry}
updated: ${new Date().toISOString().slice(0,10)}
---

## 公司简介
${info.name} (${info.market})

## 投资逻辑


## 关键事件


## 估值与财务


## 我的观点
`;
            file = await this.app.vault.create(filePath, content);
            new obsidian.Notice(`已创建: ${targetFolder}/${info.symbol}.md`);
        }
        return file;
    }

    // 修复现有页面元数据
    async updateCurrentPageMetadata() {
        const file = this.app.workspace.getActiveFile();
        if (!file) return;
        const cache = this.app.metadataCache.getFileCache(file);
        const ticker = cache?.frontmatter?.ticker;
        if (!ticker) {
            new obsidian.Notice("当前页面没有 ticker 属性");
            return;
        }
        new obsidian.Notice(`正在联网更新 ${ticker} 的行业数据...`);
        const metadata = await this.fetchMetadataFromFinviz(ticker);
        if (metadata) {
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter["sector"] = metadata.sector;
                frontmatter["industry"] = metadata.industry;
                frontmatter["updated"] = new Date().toISOString().slice(0,10);
            });
            new obsidian.Notice("元数据更新成功！");
        } else {
            new obsidian.Notice("更新失败，未找到数据或网络错误");
        }
    }

    async openStockPage(info) {
        const file = await this.ensureStockPage(info);
        if (file) this.app.workspace.getLeaf(false).openFile(file);
    }

    registerHover() {
        this.registerMarkdownPostProcessor((el, ctx) => {
            el.querySelectorAll("code").forEach(code => {
                const symbol = (code.textContent || "").trim().replace('$', '');
                const info = this.tickerMap.get(symbol);
                if (info) {
                    code.classList.add("stock-ticker");
                    code.setAttribute("aria-label", `${info.name}\n${info.sector || ""} | ${info.industry || ""}`);
                    if (!code.dataset.hasClick) {
                        code.dataset.hasClick = "true";
                        code.addEventListener("click", async (e) => {
                            e.stopPropagation();
                            await this.openStockPage(info);
                        });
                    }
                }
            });
        });
    }

    // ================= 智能格式化 (含 Properties 保护) =================
    smartWrap(editor, view) {
        const selection = editor.getSelection();
        const tickerSet = new Set(this.tickerMap.keys());

        // 修改说明：增加了 (?<![`\-_*]) 和 (?![`\-_*])
        // 含义：如果前后是 ` - _ * 中的任何一个，则不匹配。
        const regex = /\b(?<![`\-_*#])([A-Z]{2,5})(?![`\-_*])\b/g;

        let replaceCount = 0; // 计数器

        const replaceFunc = (text) => {
             const blocks = [];

             // 1. 保护 YAML Properties (Frontmatter)
             // 匹配文档开头的 --- ... --- 块
             text = text.replace(/^---\s*[\s\S]*?\n---\s*(\n|$)/, m => {
                 blocks.push(m); return `@@BLOCK_${blocks.length - 1}@@`;
             });

             // 2. 保护代码块
             text = text.replace(/```[\s\S]*?```/g, m => {
                 blocks.push(m); return `@@BLOCK_${blocks.length - 1}@@`;
             });

             // 3. 替换逻辑
             text = text.replace(regex, m => {
                 if (IGNORED_TICKERS.has(m)) return m;
                 if (tickerSet.has(m)) {
                     replaceCount++; // 成功修改计数 +1
                     return `\`${m}\``;
                 }
                 return m;
             });

             // 4. 还原保护块
             text = text.replace(/@@BLOCK_(\d+)@@/g, (_, i) => blocks[+i]);
             return text;
        };

        if (selection.length > 0) {
            const processed = replaceFunc(selection);
            if (processed !== selection) {
                editor.replaceSelection(processed);
                new obsidian.Notice(`✅ 成功高亮了 ${replaceCount} 个股票代码`);
            } else {
                new obsidian.Notice("⚠️ 选中区域没有需要修改的股票代码");
            }
        } else {
            const text = editor.getValue();
            const processed = replaceFunc(text);
            if (processed !== text) {
                editor.setValue(processed);
                new obsidian.Notice(`✅ 全文处理完毕，成功高亮 ${replaceCount} 个股票代码`);
            } else {
                new obsidian.Notice("⚠️ 当前文档没有发现新的股票代码");
            }
        }
    }
}
