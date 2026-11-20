# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概要

會議室預約看板：純前端單頁應用，app 由 `index.html`（HTML + CSS + 主要 JS）與 `app.js`（衝突判定）組成，另有 `test.html`。沒有建置、lint 或測試工具。

## 規格文件

- `spec.md`（v0.3）是**目前有效**的規格，實作以它為準。
- `spec-v0.1.md` 是舊版，僅供參考。其中的修改預約、30 分鐘粒度、主題/備註欄位、JSON 匯出入等，目前都**不在範圍內**，除非使用者另行要求，不要實作（日期切換與週視圖已在 v0.3 納入）。
- 驗收標準列在 `spec.md` 末段，改動後依此逐條確認。

## 開發規範

- 本專案為 index.html + app.js + test.html 三檔，禁止再拆分其他檔案，禁止引入外部框架或函式庫（含 CDN）。`app.js` 以一般 `<script src>` 載入（非 ES module），目前放衝突判定函式 `findConflict`。
- 所有介面文字與程式註解使用繁體中文。
- 每次修改後，用一句話說明改了什麼。
- 不做登入、後端、資料庫、多人同步、通知（spec.md 非目標）。

## 執行

直接用瀏覽器開啟 `index.html` 即可。預覽用的本機伺服器設定在 `.claude/launch.json`（名稱 `static`）：

```
python -m http.server 8765 --bind 127.0.0.1
```

## 程式架構（index.html 的 `<script>`）

- **設定常數**：`ROOMS`（3 間，用陣列索引當會議室 id）、`OPEN_HOUR`/`CLOSE_HOUR`（08–20，整點制）、`STORAGE_KEY`。
- **資料模型**：預約存成陣列放在 localStorage（key `meeting-room-bookings`），每筆為 `{ id, room, date, start, end, name }`；`room` 是 `ROOMS` 索引，`date` 是本機時區 `YYYY-MM-DD` 字串，`start`/`end` 是整點小時數字。
- **資料流**：每次操作都重新 `loadBookings()` 從 localStorage 讀全部資料，沒有記憶體中的狀態快取；寫入後呼叫 `render()` 整個重繪看板（`renderGrid`）與列表（`renderList`）。
- **衝突判定**（`findConflict`）：同 `room`、同 `date`，且 `新開始 < 既有結束 && 新結束 > 既有開始`；首尾相接不算衝突。
- **安全**：使用者輸入一律經 `createEl()` 以 `textContent` 寫入 DOM，不要改用 `innerHTML` 插入使用者資料。
- 表單日期變更會同步看板的查看日期（`viewDate`），送出成功後看板也會切到該筆預約的日期。
