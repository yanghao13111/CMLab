# Project phase1 運作說明

此socket傳文字功能由server和client兩部分組成。使用gcc進行編譯後，透過這兩個application建立一個簡單的聊天連接。


## 使用方式

1. **編譯**:
    ```bash
    gcc server.c -o server
    gcc client.c -o client
    ```

2. **啟動 Server**:
    - 執行server。
    ```bash
    ./server
    ```

    - 一旦啟動，server會在端口8080上監聽連接。

3. **啟動 Client**:
    - 執行client。
    ```bash
    ./client
    ```

    - Client會嘗試連接到`127.0.0.1`的8080端口，這是server的地址(本地)和端口。

4. **聊天**:
    - 在兩方的視窗中，您可以隨時發送訊息給對方。
    - 發送的訊息會顯示是誰傳送的，類似於Line的界面。

5. **結束聊天**:
    - 如果server或client中的任何一方輸入`exit`，連接將會中斷，且聊天將結束。

