// メニュー画面（ステータス強化・装備・スキル確認）
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = this.scale.width / 2;
    const p = playerData;

    // タイトル
    this.add.text(cx, 22, 'メニュー', {
      fontSize: '22px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── 基本ステータス表示 ──
    this.add.text(20, 55, 'ステータス', {
      fontSize: '15px', fill: '#ffdd66', fontFamily: 'monospace',
    });
    this.add.text(25, 76, `${p.name}   Lv.${p.level}`, {
      fontSize: '13px', fill: '#cccccc', fontFamily: 'monospace',
    });
    this.add.text(25, 93, `HP：${p.hp} / ${p.maxHp}   SP：${p.sp} / ${p.maxSp}`, {
      fontSize: '13px', fill: '#cccccc', fontFamily: 'monospace',
    });
    this.add.text(25, 110, `コイン：${p.coins}`, {
      fontSize: '13px', fill: '#ffdd44', fontFamily: 'monospace',
    });

    // 現在XP（更新対象）
    this.expText = this.add.text(this.scale.width - 20, 110, `所持XP：${p.exp}`, {
      fontSize: '13px', fill: '#44ffaa', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // 仕切り線
    const g = this.add.graphics();
    g.lineStyle(1, 0x4444aa, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 130, this.scale.width - 10, 130));

    // ── ステータス強化セクション ──
    this.add.text(20, 138, 'ステータス強化', {
      fontSize: '15px', fill: '#ffdd66', fontFamily: 'monospace',
    });
    this.add.text(this.scale.width - 20, 138, '← XPを使って強化', {
      fontSize: '11px', fill: '#888888', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // 強化できるステータスの定義
    // baseCost: 初回の必要XP（低め）, inc: 強化するたびに増えるXP（徐々に高く）
    const upgrades = [
      { key: 'maxHp',   label: 'HP(最大)',  baseCost: 5,  inc: 2,  getVal: () => p.maxHp,   apply: () => { p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); } },
      { key: 'maxSp',   label: 'SP(最大)',  baseCost: 3,  inc: 2,  getVal: () => p.maxSp,   apply: () => { p.maxSp += 5;  p.sp = Math.min(p.sp + 5,  p.maxSp); } },
      { key: 'attack',  label: '攻撃力  ',  baseCost: 6,  inc: 3,  getVal: () => p.attack,  apply: () => { p.attack++;  } },
      { key: 'defense', label: '防御力  ',  baseCost: 5,  inc: 2,  getVal: () => p.defense, apply: () => { p.defense++; } },
      { key: 'agi',     label: '機敏さ  ',  baseCost: 4,  inc: 2,  getVal: () => p.agi,     apply: () => { p.agi++;     } },
    ];

    upgrades.forEach((stat, i) => {
      this.createUpgradeRow(stat, 25, 164 + i * 30);
    });

    // XP不足メッセージ（非表示で待機）
    this.warnText = this.add.text(cx, 318, 'XPが足りません！', {
      fontSize: '13px', fill: '#ff4444', fontFamily: 'monospace',
      backgroundColor: '#220000', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setVisible(false).setDepth(5);

    // 仕切り線
    g.strokeLineShape(new Phaser.Geom.Line(10, 326, this.scale.width - 10, 326));

    // ── 装備スロット ──
    this.add.text(20, 334, '装備スロット', {
      fontSize: '14px', fill: '#ffdd66', fontFamily: 'monospace',
    });
    for (let i = 0; i < 4; i++) {
      const label = p.equipment[i] ? p.equipment[i].name : '── なし ──';
      this.add.text(25 + (i % 2) * 230, 354 + Math.floor(i / 2) * 22, `[${i + 1}] ${label}`, {
        fontSize: '13px', fill: p.equipment[i] ? '#aaffaa' : '#555566', fontFamily: 'monospace',
      });
    }

    // 仕切り線
    g.strokeLineShape(new Phaser.Geom.Line(10, 404, this.scale.width - 10, 404));

    // ── スキルスロット ──
    this.add.text(20, 412, 'スキルスロット', {
      fontSize: '14px', fill: '#ffdd66', fontFamily: 'monospace',
    });
    for (let i = 0; i < 4; i++) {
      const sk = p.skills[i] ? skillData[p.skills[i]] : null;
      const label = sk ? `${sk.name}(SP:${sk.spCost})` : '── なし ──';
      this.add.text(25 + (i % 2) * 230, 432 + Math.floor(i / 2) * 22, `[${i + 1}] ${label}`, {
        fontSize: '12px', fill: sk ? '#aaaaff' : '#555566', fontFamily: 'monospace',
      });
    }

    // スキル習得ボタン
    const learnBtn = this.add.text(cx, 478, '＋ スキルを習得する', {
      fontSize: '14px', fill: '#ffcc44', fontFamily: 'monospace',
      backgroundColor: '#332200', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    learnBtn.on('pointerover', () => learnBtn.setStyle({ fill: '#ffff88' }));
    learnBtn.on('pointerout',  () => learnBtn.setStyle({ fill: '#ffcc44' }));
    learnBtn.on('pointerdown', () => this.showSkillLearnPanel());

    // マップへ戻るボタン
    const backBtn = this.add.text(cx, 516, '◀ マップへ戻る', {
      fontSize: '17px', fill: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#334466', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00' }));
    backBtn.on('pointerout',  () => backBtn.setStyle({ fill: '#ffffff' }));
    backBtn.on('pointerdown', () => this.scene.start('MapScene'));
  }

  // スキル習得パネルを表示
  showSkillLearnPanel() {
    const cx = this.scale.width / 2;
    const p = playerData;
    const toDestroy = [];

    const dimBg = this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x000000, 0.78).setDepth(20).setInteractive();
    toDestroy.push(dimBg);

    const panelG = this.add.graphics().setDepth(21);
    panelG.fillStyle(0x111122, 1);
    panelG.fillRoundedRect(cx - 175, 88, 350, 400, 12);
    panelG.lineStyle(2, 0xaa8833, 1);
    panelG.strokeRoundedRect(cx - 175, 88, 350, 400, 12);
    toDestroy.push(panelG);

    toDestroy.push(this.add.text(cx, 108, 'スキル習得', {
      fontSize: '17px', fill: '#ffcc44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(22));

    const xpDisp = this.add.text(cx, 132, `所持XP：${p.exp}`, {
      fontSize: '13px', fill: '#44ffaa', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(22);
    toDestroy.push(xpDisp);

    // 装備中スロット（クリックで外せる）
    toDestroy.push(this.add.text(cx - 160, 154, '装備中（クリックで外す）', {
      fontSize: '11px', fill: '#888888', fontFamily: 'monospace',
    }).setDepth(22));

    p.skills.forEach((key, i) => {
      const sx = cx - 152 + i * 78;
      const sk = key ? skillData[key] : null;
      const slotBg = this.add.graphics().setDepth(22);
      slotBg.fillStyle(sk ? 0x223366 : 0x1a1a2a, 1);
      slotBg.fillRoundedRect(sx - 34, 168, 68, 24, 5);
      toDestroy.push(slotBg);

      const slotBtn = this.add.text(sx, 180, sk ? sk.name : '空き', {
        fontSize: '10px', fill: sk ? '#8888ff' : '#444444', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(23);
      toDestroy.push(slotBtn);

      if (sk) {
        slotBtn.setInteractive({ useHandCursor: true });
        slotBtn.on('pointerdown', () => {
          p.skills[i] = null;
          toDestroy.forEach(o => o.destroy());
          this.showSkillLearnPanel();
        });
      }
    });

    // 区切り線
    const sepG = this.add.graphics().setDepth(22);
    sepG.lineStyle(1, 0x333344, 1);
    sepG.strokeLineShape(new Phaser.Geom.Line(cx - 160, 200, cx + 160, 200));
    toDestroy.push(sepG);

    toDestroy.push(this.add.text(cx, 212, '習得可能なスキル', {
      fontSize: '13px', fill: '#ffdd66', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(22));

    let skillY = 236;
    learnableSkills.forEach(({ key, cost }) => {
      const sk = skillData[key];
      const equipped  = p.skills.includes(key);
      const hasSlot   = p.skills.includes(null);
      const canLearn  = !equipped && hasSlot && p.exp >= cost;
      const statusLabel = equipped ? '装備中' : !hasSlot ? 'スロット満' : `習得 ${cost}XP`;
      const statusColor = canLearn ? '#44ffaa' : equipped ? '#6688ff' : '#555555';

      const rowBg = this.add.graphics().setDepth(22);
      rowBg.fillStyle(0x1a1a2a, 1);
      rowBg.fillRoundedRect(cx - 155, skillY - 13, 310, 36, 6);
      toDestroy.push(rowBg);

      toDestroy.push(this.add.text(cx - 145, skillY - 4, sk.name, {
        fontSize: '13px', fill: equipped ? '#6688ff' : '#cccccc', fontFamily: 'monospace',
      }).setDepth(23));
      toDestroy.push(this.add.text(cx - 145, skillY + 10, `SP:${sk.spCost}  ${sk.desc}`, {
        fontSize: '10px', fill: '#888888', fontFamily: 'monospace',
      }).setDepth(23));

      const learnBtnT = this.add.text(cx + 148, skillY, statusLabel, {
        fontSize: '12px', fill: statusColor, fontFamily: 'monospace',
      }).setOrigin(1, 0.5).setDepth(23);
      toDestroy.push(learnBtnT);

      if (canLearn) {
        learnBtnT.setInteractive({ useHandCursor: true });
        learnBtnT.on('pointerover', () => learnBtnT.setStyle({ fill: '#aaffcc' }));
        learnBtnT.on('pointerout',  () => learnBtnT.setStyle({ fill: statusColor }));
        learnBtnT.on('pointerdown', () => {
          p.exp -= cost;
          p.skills[p.skills.indexOf(null)] = key;
          toDestroy.forEach(o => o.destroy());
          this.showSkillLearnPanel();
        });
      }
      skillY += 48;
    });

    // 閉じるボタン
    const closeBg = this.add.graphics().setDepth(22);
    closeBg.fillStyle(0x443333, 1);
    closeBg.fillRoundedRect(cx - 55, 452, 110, 28, 6);
    toDestroy.push(closeBg);
    const closeBtn = this.add.text(cx, 466, '閉じる', {
      fontSize: '13px', fill: '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(23);
    toDestroy.push(closeBtn);
    closeBtn.on('pointerdown', () => toDestroy.forEach(o => o.destroy()));
  }

  // ステータス強化の1行を作る
  createUpgradeRow(stat, x, y) {
    const p = playerData;
    const getCost = () => stat.baseCost + p.upgradeCount[stat.key] * stat.inc;

    // ラベル
    this.add.text(x, y, stat.label, {
      fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace',
    });

    // 現在値
    const valText = this.add.text(x + 148, y, String(stat.getVal()), {
      fontSize: '13px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    // 強化ボタン（必要XPを表示）
    const btnText = this.add.text(x + 200, y, `[強化 ${getCost()}XP]`, {
      fontSize: '12px', fill: '#44ffaa', fontFamily: 'monospace',
      backgroundColor: '#1a3a2a', padding: { x: 5, y: 2 },
    }).setInteractive({ useHandCursor: true });

    btnText.on('pointerover', () => btnText.setStyle({ fill: '#aaffcc' }));
    btnText.on('pointerout',  () => btnText.setStyle({ fill: '#44ffaa' }));

    btnText.on('pointerdown', () => {
      const cost = getCost();
      if (p.exp >= cost) {
        p.exp -= cost;
        stat.apply();
        p.upgradeCount[stat.key]++;

        // 表示を更新
        valText.setText(String(stat.getVal()));
        btnText.setText(`[強化 ${getCost()}XP]`);
        this.expText.setText(`所持XP：${p.exp}`);
      } else {
        // XP不足の警告を一時表示
        this.warnText.setVisible(true);
        this.time.delayedCall(1500, () => this.warnText.setVisible(false));
      }
    });
  }
}
