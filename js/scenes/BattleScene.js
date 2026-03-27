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
    this.turn = 'player';   // 'player' or 'enemy'
    this.battleOver = false;
  }

  create() {
    const cx = this.scale.width / 2;

    // 背景
    this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x0d0d1a);

    // 敵の名前
    this.add.text(cx, 20, `vs ${this.enemy.name}`, {
      fontSize: '22px', fill: '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 棒人間（プレイヤー）を描画
    this.drawPlayer(120, 300);

    // 敵を描画
    this.drawEnemy(360, 280);

    // HPバーを描画
    this.playerHpBar = this.createHpBar(20, 430, playerData.hp, playerData.maxHp, 0x44cc44, 'あなた');
    this.enemyHpBar  = this.createHpBar(20, 480, this.enemy.hp,  this.enemy.maxHp,  0xff4444, this.enemy.name);

    // メッセージ欄
    this.msgText = this.add.text(cx, 540, '行動を選んでください', {
      fontSize: '15px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // コマンドボタン
    this.createCommandButtons();
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
    // 怖い顔
    g.fillStyle(col, 1);
    g.fillRect(x - 10, y - 56, 6, 4);
    g.fillRect(x + 4,  y - 56, 6, 4);
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 26, x, y + 28));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 8,  x - 32, y + 8));
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 8,  x + 32, y + 8));
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 28, x - 22, y + 65));
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 28, x + 22, y + 65));
  }

  // HPバーを作る
  createHpBar(x, y, hp, maxHp, color, label) {
    const g = this.add.graphics();
    this.updateHpBar(g, x, y, hp, maxHp, color, label);
    return { g, x, y, color, label };
  }

  // HPバーを更新する
  updateHpBar(g, x, y, hp, maxHp, color, label) {
    g.clear();
    const barW = 200;
    g.fillStyle(0x333333, 1);
    g.fillRect(x + 60, y, barW, 18);
    const rate = Math.max(hp / maxHp, 0);
    g.fillStyle(color, 1);
    g.fillRect(x + 60, y, barW * rate, 18);
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeRect(x + 60, y, barW, 18);

    if (this.hpLabels) {
      this.hpLabels.forEach(t => t.destroy());
    }
    this.hpLabels = this.hpLabels || [];

    const lbl = this.add.text(x, y, label, { fontSize: '13px', fill: '#cccccc', fontFamily: 'monospace' });
    const val = this.add.text(x + 265, y, `${Math.max(hp, 0)}/${maxHp}`, { fontSize: '13px', fill: '#ffffff', fontFamily: 'monospace' });
    this.hpLabels.push(lbl, val);
  }

  // コマンドボタンを作る
  createCommandButtons() {
    const commands = [
      { label: '⚔ こうげき', action: 'attack', x: 100, col: '#ff6666' },
      { label: '✨ スキル',   action: 'skill',  x: 240, col: '#6688ff' },
      { label: '🎒 アイテム', action: 'item',   x: 380, col: '#66cc66' },
    ];

    this.cmdButtons = [];

    commands.forEach(cmd => {
      const g = this.add.graphics();
      g.fillStyle(0x222244, 1);
      g.fillRoundedRect(cmd.x - 55, 390, 110, 36, 6);

      const btn = this.add.text(cmd.x, 408, cmd.label, {
        fontSize: '14px', fill: cmd.col, fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        if (!this.battleOver && this.turn === 'player') {
          this.handlePlayerAction(cmd.action);
        }
      });

      this.cmdButtons.push({ btn, g });
    });
  }

  // プレイヤーの行動
  handlePlayerAction(action) {
    if (action === 'attack') {
      const dmg = Math.max(1, playerData.attack - Math.floor(this.enemy.defense / 2) + Phaser.Math.Between(-2, 2));
      this.enemy.hp -= dmg;
      this.setMessage(`${dmg} のダメージを与えた！`);
      this.refreshHpBars();

      if (this.enemy.hp <= 0) {
        this.time.delayedCall(800, () => this.winBattle());
      } else {
        this.turn = 'enemy';
        this.time.delayedCall(1000, () => this.enemyTurn());
      }
    } else if (action === 'skill') {
      this.setMessage('スキルはまだ準備中です');
    } else if (action === 'item') {
      this.setMessage('アイテムはまだ準備中です');
    }
  }

  // 敵のターン
  enemyTurn() {
    const dmg = Math.max(1, this.enemy.attack - Math.floor(playerData.defense / 2) + Phaser.Math.Between(-1, 1));
    playerData.hp -= dmg;
    this.setMessage(`${this.enemy.name}の攻撃！ ${dmg} のダメージを受けた！`);
    this.refreshHpBars();

    if (playerData.hp <= 0) {
      playerData.hp = 0;
      this.time.delayedCall(800, () => this.loseBattle());
    } else {
      this.turn = 'player';
    }
  }

  // HPバーを再描画
  refreshHpBars() {
    this.playerHpBar.g.clear();
    this.updateHpBar(this.playerHpBar.g, this.playerHpBar.x, this.playerHpBar.y, playerData.hp, playerData.maxHp, this.playerHpBar.color, this.playerHpBar.label);

    this.enemyHpBar.g.clear();
    this.updateHpBar(this.enemyHpBar.g, this.enemyHpBar.x, this.enemyHpBar.y, this.enemy.hp, this.enemy.maxHp, this.enemyHpBar.color, this.enemyHpBar.label);
  }

  // 勝ったとき
  winBattle() {
    this.battleOver = true;
    const exp = this.enemy.expReward;
    const coins = this.enemy.coinReward;
    playerData.exp += exp;
    playerData.coins += coins;

    // 倒した印をつける
    mapList[this.mapIndex].nodes.forEach(n => {
      if (n.enemy === this.node.enemy && n === this.node) n.cleared = true;
    });

    // レベルアップ確認
    this.checkLevelUp();

    this.setMessage(`勝利！  経験値 +${exp}  コイン +${coins}`);

    this.time.delayedCall(2000, () => {
      this.scene.start('MapScene');
    });
  }

  // 負けたとき
  loseBattle() {
    this.battleOver = true;
    playerData.hp = Math.floor(playerData.maxHp * 0.3); // HP30%で復活
    this.setMessage('倒された…  HPを30%回復してマップへ戻る');

    this.time.delayedCall(2500, () => {
      this.scene.start('MapScene');
    });
  }

  // レベルアップ判定
  checkLevelUp() {
    const needed = playerData.level * 30;
    if (playerData.exp >= needed) {
      playerData.exp -= needed;
      playerData.level++;
      playerData.maxHp += 10;
      playerData.hp = playerData.maxHp;
      playerData.attack += 2;
      playerData.defense += 1;
      this.setMessage(`レベルアップ！ Lv.${playerData.level} になった！`);
    }
  }

  // メッセージを更新する
  setMessage(text) {
    this.msgText.setText(text);
  }
}

// 敵データ一覧
const enemyData = {
  slime:  { name: 'スライム',   hp: 20, maxHp: 20, attack: 5,  defense: 2, expReward: 10, coinReward: 5  },
  goblin: { name: 'ゴブリン',   hp: 35, maxHp: 35, attack: 8,  defense: 3, expReward: 18, coinReward: 10 },
  wolf:   { name: 'オオカミ',   hp: 45, maxHp: 45, attack: 11, defense: 4, expReward: 25, coinReward: 12 },
  bat:    { name: 'コウモリ',   hp: 25, maxHp: 25, attack: 7,  defense: 2, expReward: 14, coinReward: 8  },
  spider: { name: 'クモ',       hp: 30, maxHp: 30, attack: 9,  defense: 3, expReward: 20, coinReward: 10 },
  orc:    { name: 'オーク',     hp: 60, maxHp: 60, attack: 14, defense: 6, expReward: 35, coinReward: 20 },
};
