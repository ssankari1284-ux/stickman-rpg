// メニュー画面（装備・ステータス確認・ポイント振り分け）
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = this.scale.width / 2;
    const p = playerData;

    // タイトル
    this.add.text(cx, 25, 'メニュー', {
      fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── 基本ステータス表示 ──
    this.add.text(20, 58, 'ステータス', {
      fontSize: '16px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    this.add.text(25, 80, `${p.name}   Lv.${p.level}`, {
      fontSize: '14px', fill: '#cccccc', fontFamily: 'monospace',
    });
    this.add.text(25, 98, `HP：${p.hp} / ${p.maxHp}   MP：${p.mp} / ${p.maxMp}`, {
      fontSize: '14px', fill: '#cccccc', fontFamily: 'monospace',
    });
    this.add.text(25, 116, `経験値：${p.exp}   コイン：${p.coins}`, {
      fontSize: '14px', fill: '#cccccc', fontFamily: 'monospace',
    });

    // 仕切り線
    const g = this.add.graphics();
    g.lineStyle(1, 0x4444aa, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 138, this.scale.width - 10, 138));

    // ── ステータス振り分けセクション ──
    this.add.text(20, 148, 'ステータス振り分け', {
      fontSize: '16px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    // 残りポイント表示（ボタン操作で更新される）
    this.pointsText = this.add.text(this.scale.width - 20, 148, `残りポイント：${p.statPoints}`, {
      fontSize: '14px', fill: '#ffff44', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // 振り分け可能なステータス一覧
    const allocStats = [
      { key: 'attack',  label: '攻撃力' },
      { key: 'defense', label: '防御力' },
      { key: 'speed',   label: '速  度' },
      { key: 'magic',   label: '魔  法' },
      { key: 'luck',    label: '運    ' },
    ];

    allocStats.forEach((stat, i) => {
      this.createStatRow(stat.label, stat.key, 25, 178 + i * 30);
    });

    // 仕切り線
    g.strokeLineShape(new Phaser.Geom.Line(10, 332, this.scale.width - 10, 332));

    // ── 装備スロット ──
    this.add.text(20, 342, '装備スロット', {
      fontSize: '15px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    for (let i = 0; i < 4; i++) {
      const label = p.equipment[i] ? p.equipment[i].name : '── なし ──';
      const xOffset = (i % 2) * 230;
      const yOffset = Math.floor(i / 2) * 22;
      this.add.text(25 + xOffset, 364 + yOffset, `[${i + 1}] ${label}`, {
        fontSize: '13px', fill: p.equipment[i] ? '#aaffaa' : '#666666', fontFamily: 'monospace',
      });
    }

    // 仕切り線
    g.strokeLineShape(new Phaser.Geom.Line(10, 414, this.scale.width - 10, 414));

    // ── スキルスロット ──
    this.add.text(20, 424, 'スキルスロット', {
      fontSize: '15px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    for (let i = 0; i < 4; i++) {
      const label = p.skills[i] ? p.skills[i].name : '── なし ──';
      const xOffset = (i % 2) * 230;
      const yOffset = Math.floor(i / 2) * 22;
      this.add.text(25 + xOffset, 446 + yOffset, `[${i + 1}] ${label}`, {
        fontSize: '13px', fill: p.skills[i] ? '#aaaaff' : '#666666', fontFamily: 'monospace',
      });
    }

    // マップへ戻るボタン
    const backBtn = this.add.text(cx, 502, '◀ マップへ戻る', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#334466',
      padding: { x: 18, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#ffffff' }));
    backBtn.on('pointerdown', () => {
      this.scene.start('MapScene');
    });
  }

  // ステータス1行分（ラベル・[-]・数値・[+]）を作る
  createStatRow(label, key, x, y) {
    const p = playerData;

    // ラベル
    this.add.text(x, y, label, {
      fontSize: '14px', fill: '#aaaaaa', fontFamily: 'monospace',
    });

    // [-] ボタン
    const minusBtn = this.add.text(x + 110, y, '[-]', {
      fontSize: '14px', fill: '#ff8888', fontFamily: 'monospace',
    }).setInteractive({ useHandCursor: true });

    // 現在値
    const valText = this.add.text(x + 160, y, String(p[key]).padStart(3, ' '), {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // [+] ボタン
    const plusBtn = this.add.text(x + 195, y, '[+]', {
      fontSize: '14px', fill: '#88ff88', fontFamily: 'monospace',
    }).setInteractive({ useHandCursor: true });

    // [-] を押したとき：ポイントを1つ取り戻す（最小値は1）
    minusBtn.on('pointerdown', () => {
      if (p[key] > 1) {
        p[key]--;
        p.statPoints++;
        valText.setText(String(p[key]).padStart(3, ' '));
        this.pointsText.setText(`残りポイント：${p.statPoints}`);
      }
    });

    // [+] を押したとき：ポイントを1つ使って上げる
    plusBtn.on('pointerdown', () => {
      if (p.statPoints > 0) {
        p[key]++;
        p.statPoints--;
        valText.setText(String(p[key]).padStart(3, ' '));
        this.pointsText.setText(`残りポイント：${p.statPoints}`);
      }
    });
  }
}
