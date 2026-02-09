# Stock Ticker Wrapper

> **This plugin is opinionated.**

A lightweight **Obsidian plugin** that intelligently recognizes stock tickers in your notes and turns them into clickable research entries.

Built for **investment research**, not trading dashboards.

---

## ✨ What It Does

- Detects stock tickers like `AAPL`, `TSLA`, `NVDA`
- Wraps them as inline code: `` `TICKER` ``
- Hover to preview company metadata
- Click to automatically create or open a stock research note

---

## 🧠 Smart by Design

To avoid false positives, the plugin automatically skips:

- YAML Frontmatter (Properties)
- Fenced code blocks
- Text wrapped by `- _ * #`
- Common abbreviations via a built-in blacklist  
  (CPU, GDP, API, AI, RAM, GPU, etc.)

When in doubt, it prefers **not** matching.

---

## 📂 Stock Research Pages

Stock notes are created under:

