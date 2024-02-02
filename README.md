# Computer Network Project 運作說明

## 專案描述
專注於實時通訊、用戶身份驗證和多媒體交互，並利用 Node.js、Socket.IO、WebRTC 和 MongoDB 等技術，創建了一個動態互動的網絡應用。

網址：https://drive.google.com/file/d/1HjJ4bY1-348IfmDWgrv50fC0itL32U5h/view?usp=share_link

## 實現功能
### basic
- **用戶身份驗證**：使用 bcrypt 進行密碼加密，通過自訂的 cookie 機制進行安全的註冊和登入流程。
- **即時留言板**：採用 Socket.IO 實現，允許用戶即時發布和查看消息。
- **音頻和視頻流媒體**：利用 WebRTC 實現實時音頻和視頻通信功能。
### bonus
- **multithread性能提升**：通過多線程實現提高服務器性能，有效利用服務器資源。
- **persistent HTTP 連接**：通過實現持久化 HTTP 連接，提高網絡效率。
- **自簽 SSL 證書**：使用 OpenSSL 生成自簽名 SSL 證書，確保數據傳輸的安全。

## 使用技術
- 後端：Node.js、Express、Socket.IO、MongoDB、Mongoose
- 前端：HTML、CSS、JavaScript
- 安全性：bcrypt、SSL/TLS（OpenSSL）: 54.253.101.2
- 實時通信：WebRTC、Socket.IO

## 安裝與設置
2. 安裝套件：在項目目錄下運行 `npm install`。
3. 確保 MongoDB 正在運行且可訪問。
4. 啟動服務器：`node src/server.js`

## 使用方法
- **註冊和登入**：用戶可以註冊帳號並登入以訪問應用程序。
- **留言板**：在留言板上發布和查看即時消息。
- **視頻和音頻通話**：與其他用戶發起和參與視頻和音頻通話。

## 文件結構概覽
- `server.js`：實現 Express 和 Socket.IO 的主服務器文件。
- `script.js`：前端 JavaScript，處理用戶互動和實時功能。
- `/public`：靜態文件，包括 HTML、CSS 和client端script。
- `/models`：MongoDB 的用戶和消息數據模型。
