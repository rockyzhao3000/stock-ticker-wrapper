# Obsidian Stock Ticker Wrapper

一个为 **Obsidian** 用户打造的智能股票代码识别与管理插件，面向**投资研究 / 宏观分析 / 行业跟踪**场景，自动识别文档中的股票代码（Ticker），并提供 **高亮、悬停信息、点击生成公司页面、行业数据补全** 等能力。

---

## ✨ 功能特性

### 🧠 智能识别股票代码

* 自动识别形如 `AAPL`、`TSLA`、`NVDA` 的股票代码
* 支持 **全文** 或 **选中区域** 处理
* 自动跳过：

  * YAML Frontmatter（Properties）
  * 代码块 ```
  * 被 `- _ * #` 包裹的内容
* 内置 **大规模黑名单**，避免误伤常见缩写（如 CPU / GDP / API / AI 等）

### 🎯 一键高亮 + 可点击

* 股票代码会被包裹为 `` `TICKER` ``
* 悬停显示：公司名称 / 行业 / 细分领域
* 点击即可自动创建或打开对应股票页面

### 📂 自动生成股票研究页面

* 统一路径：

  ```
  经济/Stocks/{TICKER}.md
  ```
* 自动生成标准化模板（含 Frontmatter）：

  * ticker
  * name
  * market
  * sector
  * industry
  * updated

### 🌐 自动补全行业数据

* 数据源：

  * DumbStock API（NYSE / NASDAQ / AMEX）
  * SEC 官方公司列表
  * Finviz（用于补全 sector / industry）
* 本地缓存，启动即用
* 支持 **强制刷新全部数据**

### 🛡️ 稳定 & 克制的设计

* 不侵入正文结构
* 不破坏已有格式
* 优先使用本地缓存
* 网络失败自动降级

---

## 📦 安装方式

### 手动安装（推荐给开发者）

1. 下载或克隆本仓库
2. 将整个目录复制到：

   ```
   <你的 Obsidian Vault>/.obsidian/plugins/stock-ticker-wrapper/
   ```
3. 确保目录内包含：

   * `main.js`
   * `manifest.json`
4. 重启 Obsidian
5. 在 **设置 → 第三方插件** 中启用插件

---

## ⌨️ 可用命令

在命令面板（`Cmd/Ctrl + P`）中：

* **Smart Format Stock Tickers**
  👉 智能扫描并高亮股票代码

* **Force Update Stock Data Source**
  👉 强制从网络刷新全部股票数据

* **Update Metadata for Current Stock Page**
  👉 更新当前股票页面的行业 / 细分领域信息

---

## 🧪 示例

原文：

```
NVDA 和 TSLA 在 AI 产业链中占据核心位置。
```

处理后：

```
`NVDA` 和 `TSLA` 在 AI 产业链中占据核心位置。
```

点击 `NVDA` 👉 自动生成：

```
经济/Stocks/NVDA.md
```

---

## 🗂️ 生成的股票页面模板

```markdown
---
ticker: NVDA
name: NVIDIA Corp.
market: NASDAQ
sector: Technology
industry: Semiconductors
updated: 2026-02-06
---

## 公司简介

## 投资逻辑

## 关键事件

## 估值与财务

## 我的观点
```

---

## ⚠️ 已知限制

* 行业数据依赖 Finviz 页面结构（非官方 API）
* 当前主要覆盖美股 / ASX
* 不适用于加密货币代码

---

## 🧭 适合谁使用？

* 📈 投资研究 / 股票复盘
* 🧠 宏观 & 行业分析
* 📒 使用 Obsidian 构建投资知识库的用户

---

## 📜 License

MIT License

---

## 🤝 致谢

* Obsidian 官方 API
* DumbStock API
* SEC EDGAR
* Finviz

---

如果你正在用 Obsidian 搭建 **投资研究系统**，这个插件就是为你准备的。🚀
