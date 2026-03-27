// バトル画面
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.node = data.node;
    this.mapIndex = data.mapIndex;

    // 敵データを取得
    this.enemy = Object.assign({}, enemyData[data.node.enemy] || enemyData.slime);

    // バトルの状態管理
    this.battleOver = false;

    // AGI比較で先攻後攻を決定
    this.playerFirst = playerData.agi >= this.enemy.agi;
    this.turn = this.playerFirst ? 'player' : 'enemy';
  }

  create() {
    const cx = this.scale.width / 2;

    // 背景
    this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x0d0d1a);

    // 敵の名前
    this.add.text(cx, 20, `vs ${this.enemy.name}`, {
      fontSize: '22px', fill: '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 先攻後攻の表示
    const firstText = this.playerFirst ? '先攻！' : `${this.enemy.name}が先手！`;
    this.add.text(cx, 50, firstText, {
      fontSize: '13px', fill: this.playerFirst ? '#88ff88' : '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 棒人間（プレイヤー）を描画
    this.drawPlayer(120, 290);

    // 敵を描画
    this.drawEnemy(360, 270);

    // HPバー・SPバーを描画
    this.playerHpBar = this.createBar(20, 415, playerData.hp, playerData.maxHp, 0x44cc44, 'あなた HP');
    this.playerSpBar = this.createBar(20, 440, playerData.sp, playerData.maxSp, 0x4488ff, '       SP');
    this.enemyHpBar  = this.createBar(20, 465, this.enemy.hp, this.enemy.maxHp,  0xff4444, `${this.enemy.name} HP`);

    // メッセージ欄
    this.msgText = this.add.text(cx, 500, '行動を選んでください', {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // コマンドボタン（2×2）
    this.createCommandButtons();

    // 敵先攻の場合は敵から攻撃開始
    if (!this.playerFirst) {
      this.disableButtons();
      this.time.delayedCall(800, () => this.enemyTurn());
    }
  }

  // プレイヤーの棒人間を描画
  drawPlayer(x, y) {
    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff, 1);
    g.strokeCircle(x, y - 50, 22);
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 28, x, y + 25));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 10, x - 30, y + 5));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 10, x + 30, y - 15));
    g.lineStyle(4, 0xffdd00, 1);
    g.strokeLineShape(new Phaser.Geom.Line(x + 30, y - 15, x + 55, y - 38));
    g.lineStyle(4, 0xffffff, 1);
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 25, x - 20, y + 60));
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 25, x + 20, y + 60));
  }

  // 敵キャラを描画
  drawEnemy(x, y) {
    const g = this.add.graphics();
    const col = 0xff6666;
    g.lineStyle(4, col, 1);
    g.strokeCircle(x, y - 50, 24);
    g.fillStyle(col, 1);
    g.fillRect(x - 10, y - 56, 6, 4);
    g.fillRect(x + 4,  y - 56, 6, 4);
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 26, x, y + 28));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 8,  x - 32, y + 8));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 8,  x + 32, y + 8));
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 28, x - 22, y + 65));
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 28, x + 22, y + 65));
  }

  // HP/SPバーを作る
  createBar(x, y, val, maxVal, color, label) {
    const g = this.add.graphics();
    this.redrawBar(g, x, y, val, maxVal, color, label);
    return { g, x, y, color, label, maxVal };
  }

  // バーを描き直す
  redrawBar(g, x, y, val, maxVal, color, label) {
    g.clear();
    const barW = 180;
    g.fillStyle(0x333333, 1);
    g.fillRect(x + 75, y, barW, 14);
    const rate = Math.max(val / maxVal, 0);
    g.fillStyle(color, 1);
    g.fillRect(x + 75, y, barW * rate, 14);
    g.lineStyle(1, 0xffffff, 0.3);
    g.strokeRect(x + 75, y, barW, 14);
  }

  // コマンドボタンを2×2で作る
  createCommandButtons() {
    const commands = [
      { label: '⚔ 攻撃',  action: 'attack', x: 130, y: 560, col: '#ff8888' },
      { label: '✨ スキル', action: 'skill',  x: 350, y: 560, col: '#8888ff' },
      { label: '🎒 道具',  action: 'item',   x: 130, y: 600, col: '#88cc88' },
      { label: '💨 逃げる', action: 'run',    x: 350, y: 600, col: '#ffcc44' },
    ];

    this.cmdButtons = [];

    commands.forEach(cmd => {
      const g = this.add.graphics();
      g.fillStyle(0x1a1a3a, 1);
      g.fillRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);
      g.lineStyle(1, 0x4444aa, 1);
      g.strokeRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);

      const btn = this.add.text(cmd.x, cmd.y, cmd.label, {
        fontSize: '15px', fill: cmd.col, fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => {
        g.clear();
        g.fillStyle(0x2a2a5a, 1);
        g.fillRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);
        g.lineStyle(2, 0x8888ff, 1);
        g.strokeRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);
      });
      btn.on('pointerout', () => {
        g.clear();
        g.fillStyle(0x1a1a3a, 1);
        g.fillRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);
        g.lineStyle(1, 0x4444aa, 1);
        g.strokeRoundedRect(cmd.x - 90, cmd.y - 18, 180, 34, 6);
      });
      btn.on('pointerdown', () => {
        if (!this.battleOver && this.turn === 'player') {
          this.handlePlayerAction(cmd.action);
        }
      });

      this.cmdButtons.push({ btn, g });
    });

    // ラベルを別途追加（HP/SP数値）
    this.hpLabel   = this.add.text(260, 415, '', { fontSize: '12px', fill: '#ccffcc', fontFamily: 'monospace' });
    this.spLabel   = this.add.text(260, 440, '', { fontSize: '12px', fill: '#aaccff', fontFamily: 'monospace' });
    this.ehpLabel  = this.add.text(260, 465, '', { fontSize: '12px', fill: '#ffcccc', fontFamily: 'monospace' });
    this.nameLabel = this.add.text(20, 415, 'あなた HP', { fontSize: '12px', fill: '#cccccc', fontFamily: 'monospace' });
    this.spNameLabel = this.add.text(20, 440, '       SP', { fontSize: '12px', fill: '#aaaacc', fontFamily: 'monospace' });
    this.enemyNameLabel = this.add.text(20, 465, `${this.enemy.name} HP`, { fontSize: '12px', fill: '#ffaaaa', fontFamily: 'monospace' });
    this.refreshBars();
  }

  // ボタンを無効化（敵ターン中）
  disableButtons() {
    this.cmdButtons.forEach(({ btn }) => btn.setAlpha(0.4));
    this.turn = 'enemy';
  }

  // ボタンを有効化（プレイヤーターン）
  enableButtons() {
    this.cmdButtons.forEach(({ btn }) => btn.setAlpha(1));
    this.turn = 'player';
  }

  // プレイヤーの行動
  handlePlayerAction(action) {
    this.disableButtons();

    if (action === 'attack') {
      const dmg = Math.max(1, playerData.attack - Math.floor(this.enemy.defense / 2) + Phaser.Math.Between(-2, 2));
      this.enemy.hp -= dmg;
      this.setMessage(`${dmg} のダメージを与えた！`);
      this.refreshBars();

      if (this.enemy.hp <= 0) {
        this.time.delayedCall(700, () => this.winBattle());
      } else {
        this.time.delayedCall(900, () => this.enemyTurn());
      }
    } else if (action === 'skill') {
      this.setMessage('スキルはまだ準備中です');
      this.time.delayedCall(1000, () => this.enableButtons());
    } else if (action === 'item') {
      this.setMessage('道具はまだ準備中です');
      this.time.delayedCall(1000, () => this.enableButtons());
    } else if (action === 'run') {
      // 50%の確率で逃げられる
      if (Phaser.Math.Between(0, 1) === 0) {
        this.setMessage('うまく逃げ切った！');
        this.time.delayedCall(1200, () => this.scene.start('MapScene'));
      } else {
        this.setMessage('逃げられなかった…');
        this.time.delayedCall(900, () => this.enemyTurn());
      }
    }
  }

  // 敵のターン
  enemyTurn() {
    if (this.battleOver) return;
    const dmg = Math.max(1, this.enemy.attack - Math.floor(playerData.defense / 2) + Phaser.Math.Between(-1, 1));
    playerData.hp -= dmg;
    this.setMessage(`${this.enemy.name}の攻撃！ ${dmg} のダメージを受けた！`);
    this.refreshBars();

    if (playerData.hp <= 0) {
      playerData.hp = 0;
      this.time.delayedCall(700, () => this.loseBattle());
    } else {
      this.time.delayedCall(600, () => this.enableButtons());
    }
  }

  // バーと数値を再描画
  refreshBars() {
    this.redrawBar(this.playerHpBar.g, this.playerHpBar.x, this.playerHpBar.y, playerData.hp, playerData.maxHp, this.playerHpBar.color, '');
    this.redrawBar(this.playerSpBar.g, this.playerSpBar.x, this.playerSpBar.y, playerData.sp, playerData.maxSp, this.playerSpBar.color, '');
    this.redrawBar(this.enemyHpBar.g,  this.enemyHpBar.x,  this.enemyHpBar.y,  this.enemy.hp, this.enemy.maxHp, this.enemyHpBar.color, '');

    if (this.hpLabel)  this.hpLabel.setText(`${Math.max(playerData.hp, 0)}/${playerData.maxHp}`);
    if (this.spLabel)  this.spLabel.setText(`${playerData.sp}/${playerData.maxSp}`);
    if (this.ehpLabel) this.ehpLabel.setText(`${Math.max(this.enemy.hp, 0)}/${this.enemy.maxHp}`);
  }

  // 勝ったとき
  winBattle() {
    this.battleOver = true;
    const exp   = this.enemy.expReward;
    const coins = this.enemy.coinReward;
    playerData.exp    += exp;
    playerData.coins  += coins;

    // 倒した印をつける
    mapList[this.mapIndex].nodes.forEach(n => {
      if (n === this.node) n.cleared = true;
    });

    this.checkLevelUp();
    this.setMessage(`勝利！  経験値 +${exp}  コイン +${coins}\nメニューでステータスを強化しよう！`);

    this.time.delayedCall(2500, () => this.scene.start('MapScene'));
  }

  // 負けたとき（報酬なし・HP=1でマップへ）
  loseBattle() {
    this.battleOver = true;
    playerData.hp = 1;
    this.setMessage('やられた…  報酬なし。HP1でマップへ戻る');

    this.time.delayedCall(2500, () => this.scene.start('MapScene'));
  }

  // レベルアップ判定（XP上乗せのみ。ステータスはメニューで自分で強化）
  checkLevelUp() {
    const needed = playerData.level * 40;
    if (playerData.exp >= needed) {
      playerData.level++;
      this.setMessage(`レベルアップ！ Lv.${playerData.level} になった！\nメニューでステータスを強化しよう！`);
    }
  }

  // メッセージを更新する
  setMessage(text) {
    this.msgText.setText(text);
  }
}

// 敵データ一覧（agiを追加）
const enemyData = {
  slime:  { name: 'スライム', hp: 20, maxHp: 20, attack: 5,  defense: 2, agi: 3,  expReward: 12, coinReward: 5  },
  goblin: { name: 'ゴブリン', hp: 35, maxHp: 35, attack: 8,  defense: 3, agi: 5,  expReward: 20, coinReward: 10 },
  wolf:   { name: 'オオカミ', hp: 45, maxHp: 45, attack: 11, defense: 4, agi: 8,  expReward: 28, coinReward: 12 },
  bat:    { name: 'コウモリ', hp: 25, maxHp: 25, attack: 7,  defense: 2, agi: 9,  expReward: 16, coinReward: 8  },
  spider: { name: 'クモ',     hp: 30, maxHp: 30, attack: 9,  defense: 3, agi: 7,  expReward: 22, coinReward: 10 },
  orc:    { name: 'オーク',   hp: 60, maxHp: 60, attack: 14, defense: 6, agi: 4,  expReward: 40, coinReward: 20 },
};
