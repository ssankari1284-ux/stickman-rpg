// ゲーム全体の設定
const config = {
  type: Phaser.AUTO,         // 描画方法を自動選択
  width: 480,                // 画面の横幅（ピクセル）
  height: 640,               // 画面の縦幅（ピクセル）
  backgroundColor: '#1a1a2e',
  scene: [TitleScene, MapScene, BattleScene, MenuScene], // 使用する画面の一覧
};

// プレイヤーのデータ（ゲーム全体で共有する）
const playerData = {
  name: '棒人間',
  hp: 80,  maxHp: 80,
  sp: 20,  maxSp: 20,    // SP（スキルを使うためのポイント）
  attack: 8,
  defense: 4,
  agi: 6,                // AGI（機敏さ）：先攻後攻に影響する
  level: 1,
  exp: 30,               // 勝利で入手。メニューでステータス強化に使う
  coins: 50,
  upgradeCount: {        // 各ステータスを何回強化したかを記録
    maxHp: 0, maxSp: 0, attack: 0, defense: 0, agi: 0,
  },
  equipment: [null, null, null, null], // 装備スロット（4つ）
  skills: [null, null, null, null],    // スキルスロット（4つ）
  currentMap: 0,
};

// ゲームを起動する
const game = new Phaser.Game(config);
