# ⚡ JournalEdge

JournalEdge is a lightweight, responsive, and highly customizable trading journal and analytics dashboard. Built for forex, crypto, and commodity traders, it allows you to log trades, track confluences (like SMC and ICT concepts), manage multiple trading accounts, and visualize performance metrics without relying on bulky third-party software.

Currently in **v1.0**, JournalEdge operates entirely within your browser using Local Storage, ensuring your data is fast, private, and immediately accessible.

## 🚀 Key Features

* **Multi-Account Management:** Create and toggle between multiple trading accounts (e.g., Personal MT5, Tradelocker Evaluation Phases) under a single profile.
* **Advanced Analytics:** Automatically calculates Net P&L, Win Rate, Profit Factor, Active/Closed Trades, and Average Hold Time.
* **Dynamic Equity Curve:** Visualizes your account balance growth over time using an interactive Chart.js line graph.
* **Comprehensive Trade Logging:** Log specific assets (EUR/USD, XAU/USD, ETH/USD, etc.), direction, lot sizes, entry/exit prices, and custom setup tags.
* **Two-Step Trade Lifecycle:** Open trades track your active exposure, while only closed trades impact your historical P&L and equity curve.
* **One-Click CSV Export:** Export your raw trade data to Excel/CSV instantly for external spreadsheet analysis.
* **Dark-Mode UI:** A premium, custom-built CSS interface designed for long trading sessions with zero external framework dependencies.

## 🛠️ Tech Stack

* **Frontend:** HTML5, Custom CSS3, Vanilla JavaScript
* **Data Visualization:** Chart.js
* **Icons:** FontAwesome
* **Database (Current):** Browser Local Storage

## 💻 How to Use (Local Setup)

Because JournalEdge v1.0 uses Local Storage, there are no servers or databases to configure. 

1. **Clone or Download** this repository to your local machine.
2. Open the project folder.
3. Double-click the `index.html` file to open it in your default web browser (Chrome, Safari, Edge, etc.).
4. Create your local profile, set up your first trading account, and start logging trades.

*Note: Clearing your browser's cache/local storage will erase your trade data in this version. Always use the "Export .csv" button to backup your data locally.*

## 🗺️ Roadmap / Upcoming Features

* **Cloud Sync (v2.0):** Integration with Google Firebase Firestore to persist data across multiple devices and prevent accidental data loss.
* **Enhanced Metrics:** Best/worst trading days, maximum drawdown tracking, and expectancy formulas.
* **Image Uploads:** Attaching TradingView chart screenshots directly to logged trades.
