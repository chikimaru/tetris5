# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-25

### 🎮 Initial Release

#### Added
- **完全機能テトリスゲーム**
  - HTML5 Canvas ベースのレンダリングシステム
  - 7種類のテトロミノ（I, O, T, S, Z, J, L）をサポート
  - スムーズなピース移動・回転システム

- **ゲーム機能**
  - リアルタイムライン消去システム
  - レベル別スコア計算（1-4ライン消去対応）
  - 10ライン毎のレベルアップシステム
  - 次のピース表示機能
  - ハードドロップ機能（スペースキー）
  - ソフトドロップ機能（↓キー）

- **ユーザーインターフェース**
  - レスポンシブデザイン対応
  - リアルタイムスコア・レベル・ライン表示
  - 一時停止・リスタート機能
  - 美しいグラデーション背景
  - モバイル対応レイアウト

- **操作システム**
  - 矢印キーによるピース操作
  - スペースキーハードドロップ
  - Pキー一時停止
  - Wall Kick システム（回転時の壁蹴り）

- **技術仕様**
  - ES6 クラスベース設計
  - requestAnimationFrame による滑らかなアニメーション
  - イベント駆動型アーキテクチャ
  - Canvas 2D API 使用

#### Game Mechanics
- **スコアシステム**:
  - 1ライン消去: 40 × レベル
  - 2ライン消去: 100 × レベル
  - 3ライン消去: 300 × レベル
  - 4ライン消去: 1200 × レベル
  - ソフトドロップ: +1ポイント/ブロック
  - ハードドロップ: +2ポイント/ブロック

- **レベルシステム**:
  - レベル = floor(消去ライン数 ÷ 10) + 1
  - 落下速度 = max(50, 1000 - (レベル-1) × 50) ms
  - レベル20で最高速度到達

#### Files Added
- `index.html` - メインHTMLファイル
- `style.css` - スタイルシートとレスポンシブデザイン
- `tetris.js` - ゲームロジック（Tetrisクラス）
- `CLAUDE.md` - 開発者向けドキュメント
- `README.md` - プロジェクト説明とプレイ方法
- `CHANGELOG.md` - このファイル

#### Development
- Git バージョン管理システム導入
- GitHub リポジトリ準備
- 包括的ドキュメント作成

---

🤖 Generated with [Claude Code](https://claude.ai/code)