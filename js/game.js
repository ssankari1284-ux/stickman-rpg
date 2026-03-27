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
  hp: 100,
  maxHp: 100,
  mp: 30,
  maxMp: 30,
  attack: 10,
  defense: 5,
  speed: 8,
  magic: 6,
  luck: 4,
  level: 1,
  exp: 0,
  coins: 50,
  statPoints: 3,                       // 振り分け可能なステータスポイント
  equipment: [null, null, null, null], // 装備スロット（4つ）
  skills: [null, null, null, null],    // スキルスロット（4つ）
  currentMap: 0,
};

// ゲームを起動する
const game = new Phaser.Game(config);
