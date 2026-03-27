// メニュー画面（装備・ステータス確認）
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

    // ステータス表示
    this.add.text(20, 70, 'ステータス', {
      fontSize: '17px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    const stats = [
      `名前：${p.name}   Lv.${p.level}`,
      `HP：${p.hp} / ${p.maxHp}`,
      `MP：${p.mp} / ${p.maxMp}`,
      `攻撃：${p.attack}   防御：${p.defense}`,
      `速度：${p.speed}   魔法：${p.magic}   運：${p.luck}`,
      `経験値：${p.exp}   コイン：${p.coins}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(25, 100 + i * 26, line, {
        fontSize: '15px', fill: '#cccccc', fontFamily: 'monospace',
      });
    });

    // 仕切り線
    const g = this.add.graphics();
    g.lineStyle(1, 0x4444aa, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 270, this.scale.width - 10, 270));

    // 装備スロット
    this.add.text(20, 282, '装備スロット（4つ）', {
      fontSize: '17px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    for (let i = 0; i < 4; i++) {
      const label = p.equipment[i] ? p.equipment[i].name : '── なし ──';
      this.add.text(25, 310 + i * 30, `[${i + 1}] ${label}`, {
        fontSize: '14px', fill: p.equipment[i] ? '#aaffaa' : '#888888', fontFamily: 'monospace',
      });
    }

    // 仕切り線
    g.strokeLineShape(new Phaser.Geom.Line(10, 436, this.scale.width - 10, 436));

    // スキルスロット
    this.add.text(20, 448, 'スキルスロット（4つ）', {
      fontSize: '17px', fill: '#ffdd66', fontFamily: 'monospace',
    });

    for (let i = 0; i < 4; i++) {
      const label = p.skills[i] ? p.skills[i].name : '── なし ──';
      this.add.text(25, 476 + i * 30, `[${i + 1}] ${label}`, {
        fontSize: '14px', fill: p.skills[i] ? '#aaaaff' : '#888888', fontFamily: 'monospace',
      });
    }

    // マップへ戻るボタン
    const backBtn = this.add.text(cx, 610, '◀ マップへ戻る', {
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
}
