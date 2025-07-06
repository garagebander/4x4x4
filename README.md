# 4x4x4 立体四目並べ（3D Connect Four）

> **このプロジェクトはGitHub Copilotによって全自動生成されており、人間は1行もコードを書いていません。**

![screenshot](./screenshot.png)

このプロジェクトは、React + TypeScript + Viteで作成した4x4x4の立体四目並べ（3D Connect Four）Webアプリです。

## 公開ページ
- [GitHub Pagesで遊ぶ](https://garagebander.github.io/4x4x4/)

## 遊び方
- あなた vs AI（2人対戦も可）
- 盤面のセルをクリックしてコマを配置
- 先に縦・横・斜めいずれかで4つ並べた方が勝ち
- 3D盤面はドラッグで回転可能
- 「リセット」ボタンで再スタート

## 主な機能
- 4x4x4の3D/2D盤面表示（同時表示）
- 重力ルールによるコマ配置
- 勝敗判定（全方向対応）
- AI対戦（ランダム→1手先読み→ミニマックス深さ4）
- 3Dグラフィックの回転・透明度・色分け
- GitHub Pages自動デプロイ

## 技術スタック
- React + TypeScript + Vite
- CSS（シンプルUI）
- GitHub Actions + gh-pages

## セットアップ（ローカル開発）
```bash
npm install
npm run dev
```
- 開発サーバ: http://localhost:5173

## ディレクトリ構成（主要部分）
- `src/` ... Reactコンポーネント・ロジック
- `.github/` ... GitHub Actionsワークフロー

## 今後の拡張例
- デザイン・アニメーション強化
- オンライン対戦/AI強化
- スマホ対応
- 履歴表示・リプレイ

## ライセンス
MIT
