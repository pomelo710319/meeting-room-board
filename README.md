# 會議室預約看板

讓公司同仁直接在瀏覽器上預約會議室，並避免時段衝突的單頁應用。

- **純前端**：沒有後端、資料庫，也不需要登入；資料存在瀏覽器的 localStorage。
- **零依賴**：不使用任何外部框架或函式庫（含 CDN），也沒有建置步驟。
- 目前有效的規格是 [`spec.md`](spec.md)（v0.3）；[`spec-v0.1.md`](spec-v0.1.md) 是舊版，只供參考。

## 功能清單

- **新增預約**：選擇會議室（3 間）、日期、開始與結束時段（整點制，08:00–20:00），填寫預約人姓名後送出。
- **衝突檢查**：同一間會議室、同一天的時段重疊時會拒絕送出並提示；首尾相接（例如 10–12 與 12–14）不算衝突。
- **日視圖**：三間會議室並排的時刻表，可切換「前一天／今天／後一天」或直接選日期；今天會顯示目前時間線。
- **週視圖**：選一間會議室，顯示週一到週日的預約，可切換「上一週／本週／下一週」，點日期可回到該天的日視圖。
- **快速填表**：點看板上的空時段，會自動帶入會議室、日期與時段到表單。
- **預約列表**：依時間排序列出目前視圖中的預約。
- **取消預約**：在列表中按「取消」，確認後刪除該筆預約。
- **匯出 CSV**：將全部預約匯出成 CSV（含 BOM，Excel 可正確顯示中文）。
- **資料保存**：重新整理頁面後資料仍在。

> 不在範圍內（[`spec.md`](spec.md) 的非目標）：登入與權限、後端與資料庫、多人即時同步、Email／通知。

## 如何開啟使用

### 方法一：直接開檔

用瀏覽器開啟 `index.html` 即可使用。

### 方法二：本機伺服器（建議）

在專案根目錄執行：

```bash
python -m http.server 8765 --bind 127.0.0.1
```

接著以瀏覽器開啟 <http://127.0.0.1:8765/>。

> 注意：localStorage 依「來源（origin）」區分。用 `file://` 直接開檔與用 `http://127.0.0.1:8765` 開啟，看到的是兩份不同的預約資料。

若要清空所有預約，可在瀏覽器開發者工具的 Console 執行：

```js
localStorage.removeItem('meeting-room-bookings');
```

## 如何執行測試

專案沒有測試框架，測試以瀏覽器頁面呈現：

1. 用瀏覽器開啟 `test.html`（直接開檔或透過上面的本機伺服器 <http://127.0.0.1:8765/test.html>）。
2. 頁面頂端會顯示「通過 N 項／共 M 項」：全部通過時為綠色，有失敗時為紅色。
3. 下方表格逐項列出測試名稱、預期值、實際值與結果（✅／❌），失敗的列會標底色。

目前的測試針對 `app.js` 的衝突判定函式 `findConflict`，涵蓋：完全相同、完全錯開、部分重疊（前段／後段）、互相包含、緊鄰時段、不同會議室、不同日期等情況。

新增測試時，在 `test.html` 的 `cases` 陣列加入一筆 `{ name, booking, expected }` 即可（`expected` 為 `true` 代表應判定為衝突）。

除了自動測試，改動介面後也請依 [`spec.md`](spec.md) 末段的「驗收標準」逐條手動確認。

## 檔案結構

```
meeting-room-board/
├── index.html      # 主程式：HTML 結構、CSS 樣式與主要 JavaScript
├── app.js          # 衝突判定函式 findConflict（index.html 與 test.html 共用）
├── test.html       # findConflict 的測試頁
├── spec.md         # 目前有效的規格（v0.3），含驗收標準
├── spec-v0.1.md    # 舊版規格，僅供參考
├── CLAUDE.md       # 給 Claude Code 的開發說明
└── .claude/
    └── launch.json # 本機預覽伺服器設定（名稱 static，port 8765）
```

### 程式架構重點

- **設定常數**（`index.html`）：`ROOMS`（3 間，以陣列索引當會議室 id）、`OPEN_HOUR`／`CLOSE_HOUR`（8 與 20）、`STORAGE_KEY`。
- **資料模型**：所有預約以陣列存在 localStorage（key：`meeting-room-bookings`），每筆格式如下：

  ```js
  { id, room, date, start, end, name }
  // room：ROOMS 的索引；date：本機時區的 'YYYY-MM-DD'；start／end：整點小時數字
  ```

- **資料流**：沒有記憶體中的狀態快取。每次操作都以 `loadBookings()` 從 localStorage 重新讀取，寫入後呼叫 `render()` 重繪整個看板與列表。
- **衝突判定**（`app.js` 的 `findConflict`）：同 `room`、同 `date`，且 `新開始 < 既有結束 && 新結束 > 既有開始` 時視為衝突。
- **載入方式**：`app.js` 以一般 `<script src>` 載入（不是 ES module），函式掛在全域。

## 開發規範

- 維持 `index.html` + `app.js` + `test.html` 三個程式檔，不再拆分其他檔案，也不引入外部框架或函式庫。
- 介面文字與程式註解一律使用繁體中文。
- 使用者輸入一律以 `textContent` 寫入 DOM（`index.html` 中的 `createEl()`），不要用 `innerHTML` 插入使用者資料。
