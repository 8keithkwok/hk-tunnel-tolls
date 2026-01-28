# 香港隧道現時收費

一個讓使用者快速查看香港各收費隧道**現時收費**的 Web App，依當前時間與是否假日（星期日／公眾假期）計算分時段收費，並支援多種車種選擇。適合手機使用，可作為 portfolio 項目展示。

**Live**: https://8keithkwok.github.io/hk-tunnel-tolls/

## 功能

- **現時收費**：依香港時間與假日狀態，即時顯示各隧道當前收費
- **車種選擇**：私家車、的士、電單車、小巴、貨車、巴士等
- **假日邏輯**：使用政府公眾假期資料（1823 API），星期日亦視為假日，影響過海三隧及大欖隧道費率
- **涵蓋隧道**：紅隧、東隧、西隧、大欖隧道、大老山隧道、香港仔／城門／獅子山／沙田嶺尖山大圍隧道（劃一 $8）

## 技術棧

- **React** + **TypeScript**
- **Vite** 建置
- **Tailwind CSS v4**
- **Yarn** 套件管理
- 部署於 **GitHub Pages**

## 資料來源

- 隧道收費： [運輸署 － 行車隧道的收費](https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/toll_matters/toll_rates_of_road_tunnels_and_lantau_link/index.html)
- 公眾假期： [1823 香港公眾假期 (JSON)](https://www.1823.gov.hk/common/ical/tc.json) / [data.gov.hk](https://data.gov.hk/en-data/dataset/hk-dpo-statistic-cal)；若瀏覽器無法直接請求（CORS），則使用 repo 內 `public/holidays.json` 靜態備援

**收費資料最後更新**：2025（若運輸署調整費率或時段，需手動更新 `src/data/tollRates.ts`）

## 本地開發與建置

```bash
# 安裝依賴
yarn

# 開發模式
yarn dev

# 建置
yarn build

# 預覽建置結果
yarn preview
```

## 部署（GitHub Pages）

1. 將此 repo push 至 GitHub（例如 `hk-tunnel-tolls`）
2. 在 Repo **Settings → Pages** 中，**Source** 選 **GitHub Actions**
3. 每次 push 到 `main` 分支會觸發 `.github/workflows/deploy.yml`，自動建置並部署至 GitHub Pages

上線網址格式：`https://<username>.github.io/hk-tunnel-tolls/`  
本專案 Live：https://8keithkwok.github.io/hk-tunnel-tolls/

## 授權

本專案為展示用；隧道收費與假期資料來自政府公開資料，請以官方來源為準。
