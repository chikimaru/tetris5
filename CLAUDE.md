# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code (claude.ai/code) にガイダンスを提供します。

## プロジェクト概要

完全機能のWebベーステトリスゲーム（テトリス５）。HTML5 Canvas、JavaScript、CSS3を使用して構築されています。

## 技術スタック

- **HTML5**: 基本構造とCanvas要素
- **CSS3**: レスポンシブデザインとアニメーション
- **JavaScript ES6**: ゲームロジックとDOM操作
- **Git**: バージョン管理

## ファイル構造

```
tetris5/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── tetris.js           # ゲームロジック（Tetrisクラス）
├── CLAUDE.md           # このファイル
├── README.md           # プロジェクト説明
└── CHANGELOG.md        # 変更履歴
```

## よく使用するコマンド

### 開発環境
```bash
# ローカルでテスト
start index.html        # Windows
open index.html         # macOS
```

### Git操作
```bash
git add .
git commit -m "commit message"
git push origin main
```

### GitHub CLI
```bash
gh repo create [name] --public --source=. --push
gh repo view --web
```

## アーキテクチャ

### コアクラス: Tetris
- `initBoard()`: ゲームボード初期化
- `generateNewPiece()`: 新しいテトロミノ生成
- `isCollision()`: 衝突検出
- `placePiece()`: ピース配置
- `clearLines()`: ライン消去
- `rotatePiece()`: ピース回転
- `gameLoop()`: メインゲームループ

### 主要機能
1. **テトロミノ管理**: 7種類のピース（I,O,T,S,Z,J,L）
2. **衝突検出**: 境界とブロックの衝突判定
3. **ライン消去**: 完成ラインの検出と削除
4. **スコアリング**: レベル別スコア計算
5. **レンダリング**: Canvas描画とアニメーション

### イベント処理
- キーボード入力: 移動、回転、ドロップ
- ボタン操作: 開始、一時停止、リスタート
- ゲームループ: requestAnimationFrame使用

## 開発規約

### コーディングスタイル
- ES6クラス構文使用
- キャメルケース命名
- 適切なコメント記述
- 定数は大文字で定義

### ゲーム設定
- ボードサイズ: 10x20
- ブロックサイズ: 30px
- 初期落下間隔: 1000ms
- レベルアップ: 10ライン毎

## デバッグとテスト

### よくある問題
1. **ピース回転問題**: wall kick機能で解決
2. **ライン消去バグ**: 配列操作の順序確認
3. **スコア計算エラー**: レベル倍率の適用確認

### テスト方法
- ブラウザ開発者ツールでデバッグ
- console.logでゲーム状態確認
- 各機能の単体動作確認