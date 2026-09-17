# 格莉奇遊樂園・幸運轉盤

可獨立開啟的角色幸運轉盤。按下按鈕或直接點擊轉盤後，指針會從七位格莉奇角色中選出今天的幸運角色，並保存到本機收藏。

## 操作

- 手機與桌機：點擊轉盤或「轉動轉盤」。
- 鍵盤：空白鍵。
- 右上角可切換全部聲音並查看收藏。

## 本機執行

```bash
python3 -m http.server 4173
```

瀏覽 `http://127.0.0.1:4173/`。七位角色共用一張頭像 Atlas，頁面不使用外部 CDN。

日後嵌入 Larch 時，頁面會顯示「離開」按鈕，主題曲則交由外層統一播放。

主題曲改從 jsDelivr 載（五款共用同一個網址，瀏覽器快取共用）：`https://cdn.jsdelivr.net/gh/yazelin/glitch-park-claw@main/assets/audio/glitch-park-theme.mp3`。
Pages 直連 700 KB 要 11 秒、jsDelivr 1 秒。改檔要 purge：`https://purge.jsdelivr.net/gh/yazelin/glitch-park-claw@main/assets/audio/glitch-park-theme.mp3`。
