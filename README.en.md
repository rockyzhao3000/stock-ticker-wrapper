# Obsidian Stock Ticker Wrapper

> **This plugin is opinionated.**

A smart and minimal **Obsidian plugin** for investment-focused users.  
It automatically recognizes stock tickers in your notes and turns them into **clickable, research-oriented entry points**, without disrupting your writing flow.

Designed for **long-term investment research**, not for displaying prices or building dashboards.

---

## ✨ Features

### 🧠 Smart Stock Ticker Recognition

- Automatically detects stock tickers such as `AAPL`, `TSLA`, `NVDA`
- Works on:
  - Entire documents
  - Selected text only
- Carefully avoids false positives by:
  - Skipping YAML Frontmatter (Properties)
  - Skipping fenced code blocks
  - Skipping text wrapped by `- _ * #`
- Includes a large built-in **blacklist** to avoid common abbreviations  
  (e.g. CPU, GDP, API, AI, RAM, GPU)

---

### 🎯 Highlight, Hover & Click

- Recognized tickers are wrapped as inline code: `` `TICKER` ``
- Hover to preview:
  - Company name
  - Sector
  - Industry
- Click a ticker to:
  - Automatically create or open its research page

---

### 📂 Automatic Research Page Generation

All stock pages are created under a unified path:

经济/Stocks/{TICKER}.md


Each page includes structured Frontmatter:

- ticker
- name
- market
- sector
- industry
- updated

The page itself is a **research container**, not a data dashboard.

---

### 🌐 Automatic Metadata Enrichment

Data sources are intentionally layered:

- **DumbStock API** (NYSE / NASDAQ / AMEX)
- **SEC EDGAR** official company list
- **Finviz** (used only to enrich sector & industry)

Design choices:
- Cached locally for fast startup
- Network failures gracefully degrade
- Manual force-refresh supported

---

## 🧭 Design Philosophy

This plugin does **not** try to turn Obsidian into a trading terminal.

It is built on one simple belief:

> **A stock ticker is a knowledge index, not a visual decoration.**

---

### 🎯 Motivation

In real investment research:

- Stock tickers appear repeatedly across:
  - Macro analysis
  - Industry research
  - Event tracking
  - Personal investment theses
- Most tools either:
  - Are too intrusive
  - Break existing note structures
  - Or produce excessive false positives

**Stock Ticker Wrapper focuses on one thing:**

> Upgrading tickers into navigable research anchors — quietly and safely.

---

### 🛡️ Restraint Over Features

This plugin deliberately follows these principles:

- **Never modify content you didn’t ask to modify**
  - Frontmatter is protected
  - Code blocks are protected
  - Explicitly wrapped text is protected
- **Prefer under-matching over false positives**
  - Strict regex boundaries
  - Large blacklist
- **Failures must be silent**
  - Network issues never block writing
  - Cached data is always preferred

---

### 📂 Stock Pages Are Research Containers

Generated stock pages are **not** meant to:

- Show prices
- Track real-time financials

They are meant to hold:

- Investment thesis
- Key events
- Long-term reasoning

Supporting a stable mental model:

Macro → Industry → Company → Personal Judgment


---

### 🧠 Built for Long-Term Users

This plugin assumes you are someone who:

- Writes research notes continuously
- Revisits old decisions and assumptions
- Values structure, stability, and evolvability

It is designed for **years of use**, not one-off organization.

---

## 📦 Installation

### Manual Installation

1. Clone or download this repository
2. Copy the entire folder into:
```
	<Your Obsidian Vault>/.obsidian/plugins/stock-ticker-wrapper/
```

3. Ensure at least these files exist:
   - `main.js`
   - `manifest.json`
4. Restart Obsidian
5. Enable the plugin in **Settings → Community Plugins**

---

## ⌨️ Commands

Available via the command palette (`Cmd/Ctrl + P`):

- **Smart Format Stock Tickers**  
  Scan and wrap stock tickers intelligently

- **Force Update Stock Data Source**  
  Refresh all stock metadata from network sources

- **Update Metadata for Current Stock Page**  
  Update sector and industry for the current stock note

---

## 🧪 Example

Before:

```
NVDA and TSLA are core players in the AI supply chain.
```

After:

```
`NVDA` and `TSLA` are core players in the AI supply chain.
```

Clicking `NVDA` automatically creates:
```

经济/Stocks/NVDA.md

```

---

## 🗂️ Stock Page Template

```markdown
---
ticker: NVDA
name: NVIDIA Corp.
market: NASDAQ
sector: Technology
industry: Semiconductors
updated: 2026-02-06
---

## Company Overview

## Investment Thesis

## Key Events

## Valuation & Financials

## My Notes
```
## ⚠️ Known Limitations
- Sector / industry data depends on Finviz HTML structure

- Primarily covers US stocks and ASX

- Cryptocurrency tickers are intentionally not supported

---

## 📜 License
MIT License

---

## 🤝 Acknowledgements
- Obsidian API

- DumbStock API

- SEC EDGAR

- Finviz

