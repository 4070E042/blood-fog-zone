# 專案定位

ZombieMiniTest 是一個：

小型可維護近戰 Build 殭屍生存遊戲。

專案應保持：

- 輕量
- 可閱讀
- 容易修改
- 每次修改後都能正常啟動

# 技術狀態

- 使用 HTML、CSS、Vanilla JavaScript
- 使用傳統 `<script>` 載入
- 目前不使用 ES Modules、Bundler、Framework
- 所有 JS 位於 `js/`
- `index.html` 的 script 順序非常重要
- game loop 位於 `js/main.js`

# AI Agent 工作規則

- 修改前先分析目前結構
- 非小修改時，先提出簡短計畫
- 優先小步驟修改
- 不要過度工程化
- 不要一次大型重構
- 每次修改後都必須保持遊戲可啟動
- 除非明確要求，不要改變既有玩法
- 不要未經要求新增功能
- 不要隨意調整 script 載入順序
- 不要自行改成 ES Modules
- 不要自行導入 framework、build tools、package manager

# 維護方向

- `main.js` 保持為高層 game flow 入口
- 大型邏輯逐步移回對應 domain 檔案
- 每次修改都必須容易回退與測試
- 可讀性優先於 abstraction
- 優先維持目前程式風格