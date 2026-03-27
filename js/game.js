// ゲーム全体の設定
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: '#1a1a2e',
  scene: [TitleScene, MapScene, BattleScene, MenuScene, ShopScene, ParamScene],
};

// プレイヤーのデータ（ゲーム全体で共有する）
const playerData = {
  name: '棒人間',
  hp: 80,  maxHp: 80,
  sp: 20,  maxSp: 20,
  attack: 8,
  defense: 4,
  agi: 6,
  level: 1,
  exp: 30,
  coins: 50,
  upgradeCount: { maxHp: 0, maxSp: 0, attack: 0, defense: 0, agi: 0 },
  equipment: [null, null, null, null],
  skills: ['smash', null, null, null],  // スマッシュをデフォルト装備
  items: [],                             // 持ち物 { id, qty }
  boughtItems: {},                       // 購入済みの永続アイテム
  currentMap: 0,
};

// ステータス強化コストの設定（ParamSceneから変更可能）
const upgradeConfig = [
  { key: 'maxHp',   label: 'HP(最大)',  baseCost: 5,  inc: 2 },
  { key: 'maxSp',   label: 'SP(最大)',  baseCost: 3,  inc: 2 },
  { key: 'attack',  label: '攻撃力',    baseCost: 6,  inc: 3 },
  { key: 'defense', label: '防御力',    baseCost: 5,  inc: 2 },
  { key: 'agi',     label: '機敏さ',    baseCost: 4,  inc: 2 },
];

const game = new Phaser.Game(config);
