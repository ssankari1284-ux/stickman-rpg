// 開発者用パラメータ調整画面
class ParamScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ParamScene' });
  }

  create() {
    const cx = this.scale.width / 2;

    // 背景
    this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x0d0d1a);

    // タイトル
    this.add.text(cx, 22, 'パラメータ調整', {
      fontSize: '20px', fill: '#ffdd66', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // タブ状態
    this.currentTab = 0;
    this.tabContents = [];

    // タブボタン
    const tabLabels = ['敵データ', '強化コスト', 'スキル/道具'];
    this.tabBtns = tabLabels.map((label, i) => {
      const btn = this.add.text(50 + i * 130, 52, label, {
        fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace',
        backgroundColor: '#222233', padding: { x: 10, y: 5 },
      }).setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(2);
      btn.on('pointerdown', () => this.switchTab(i));
      return btn;
    });

    // 仕切り線
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(1, 0x333366, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 76, this.scale.width - 10, 76));

    // 戻るボタン
    const backBtn = this.add.text(cx, 612, '◀ メニューへ戻る', {
      fontSize: '15px', fill: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#334466', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);
    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00' }));
    backBtn.on('pointerout',  () => backBtn.setStyle({ fill: '#ffffff' }));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // 最初のタブを表示
    this.switchTab(0);
  }

  // タブを切り替える
  switchTab(index) {
    // 既存のタブコンテンツを破棄
    this.tabContents.forEach(o => o.destroy());
    this.tabContents = [];

    // タブボタンの見た目を更新
    this.tabBtns.forEach((btn, i) => {
      if (i === index) {
        btn.setStyle({ fill: '#ffdd66', backgroundColor: '#332200' });
      } else {
        btn.setStyle({ fill: '#aaaaaa', backgroundColor: '#222233' });
      }
    });

    this.currentTab = index;

    if (index === 0) this.buildEnemyTab();
    if (index === 1) this.buildUpgradeTab();
    if (index === 2) this.buildSkillItemTab();
  }

  // ── タブ1：敵データ ──
  buildEnemyTab() {
    const cx = this.scale.width / 2;
    const enemyKeys = Object.keys(enemyData);
    this.enemyIndex = this.enemyIndex || 0;

    const draw = () => {
      this.tabContents.forEach(o => o.destroy());
      this.tabContents = [];

      const key = enemyKeys[this.enemyIndex];
      const enemy = enemyData[key];

      // 敵の選択ナビ
      const prevBtn = this.makeNavBtn(40, 105, '◀', () => {
        this.enemyIndex = (this.enemyIndex - 1 + enemyKeys.length) % enemyKeys.length;
        draw();
      });
      const nextBtn = this.makeNavBtn(this.scale.width - 40, 105, '▶', () => {
        this.enemyIndex = (this.enemyIndex + 1) % enemyKeys.length;
        draw();
      });
      this.tabContents.push(prevBtn, nextBtn);

      const nameT = this.add.text(cx, 105, `[${this.enemyIndex + 1}/${enemyKeys.length}]  ${enemy.name}`, {
        fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.tabContents.push(nameT);

      // 編集できるパラメータの定義
      const params = [
        { label: 'HP(最大)',   get: () => enemy.maxHp,      set: (v) => { enemy.maxHp = v; enemy.hp = v; } },
        { label: '攻撃力',     get: () => enemy.attack,     set: (v) => { enemy.attack = v; } },
        { label: '防御力',     get: () => enemy.defense,    set: (v) => { enemy.defense = v; } },
        { label: '機敏さ',     get: () => enemy.agi,        set: (v) => { enemy.agi = v; } },
        { label: '獲得XP',     get: () => enemy.expReward,  set: (v) => { enemy.expReward = v; } },
        { label: '獲得コイン', get: () => enemy.coinReward, set: (v) => { enemy.coinReward = v; } },
      ];

      params.forEach((param, i) => {
        const y = 142 + i * 52;
        const row = this.makeEditRow(cx, y, param.label, param.get, param.set, 1, draw);
        row.forEach(o => this.tabContents.push(o));
      });
    };

    draw();
  }

  // ── タブ2：強化コスト ──
  buildUpgradeTab() {
    const cx = this.scale.width / 2;

    // ヘッダー
    const h1 = this.add.text(cx - 60, 88, '初期コスト', {
      fontSize: '11px', fill: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const h2 = this.add.text(cx + 80, 88, '上昇幅', {
      fontSize: '11px', fill: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.tabContents.push(h1, h2);

    upgradeConfig.forEach((cfg, i) => {
      const y = 118 + i * 88;

      // ラベル
      const labelT = this.add.text(20, y, cfg.label, {
        fontSize: '14px', fill: '#ffdd66', fontFamily: 'monospace',
      });
      this.tabContents.push(labelT);

      // baseCost の±ボタン
      const baseCostRow = this.makeEditRow(
        cx - 60, y + 28, '初期コスト',
        () => cfg.baseCost,
        (v) => { cfg.baseCost = v; },
        1, () => this.buildUpgradeTab()
      );
      baseCostRow.forEach(o => this.tabContents.push(o));

      // inc の±ボタン
      const incRow = this.makeEditRow(
        cx + 80, y + 28, '上昇幅',
        () => cfg.inc,
        (v) => { cfg.inc = v; },
        1, () => this.buildUpgradeTab()
      );
      incRow.forEach(o => this.tabContents.push(o));
    });
  }

  // ── タブ3：スキル/道具 ──
  buildSkillItemTab() {
    const cx = this.scale.width / 2;
    let y = 88;

    // スキルSPコスト
    const skHeader = this.add.text(20, y, 'スキル SP消費', {
      fontSize: '13px', fill: '#aaaaff', fontFamily: 'monospace',
    });
    this.tabContents.push(skHeader);
    y += 24;

    Object.keys(skillData).forEach(key => {
      const sk = skillData[key];
      const row = this.makeEditRow(
        cx + 40, y, sk.name,
        () => sk.spCost,
        (v) => { sk.spCost = v; },
        1, () => this.buildSkillItemTab()
      );
      row.forEach(o => this.tabContents.push(o));
      y += 44;
    });

    // スキル習得コスト
    y += 4;
    const learnHeader = this.add.text(20, y, 'スキル 習得XP', {
      fontSize: '13px', fill: '#44ffaa', fontFamily: 'monospace',
    });
    this.tabContents.push(learnHeader);
    y += 24;

    learnableSkills.forEach(entry => {
      const sk = skillData[entry.key];
      const row = this.makeEditRow(
        cx + 40, y, sk.name,
        () => entry.cost,
        (v) => { entry.cost = v; },
        5, () => this.buildSkillItemTab()
      );
      row.forEach(o => this.tabContents.push(o));
      y += 44;
    });

    // ショップ商品価格
    y += 4;
    const shopHeader = this.add.text(20, y, 'ショップ 価格', {
      fontSize: '13px', fill: '#ffdd44', fontFamily: 'monospace',
    });
    this.tabContents.push(shopHeader);
    y += 24;

    shopStock.forEach(item => {
      const row = this.makeEditRow(
        cx + 40, y, item.name,
        () => item.cost,
        (v) => { item.cost = v; },
        5, () => this.buildSkillItemTab()
      );
      row.forEach(o => this.tabContents.push(o));
      y += 44;
    });
  }

  // ── 共通：[-][値][+] の1行を作る ──
  // cx: 中央X, y: Y座標, label: ラベル文字, get/set: 値の取得・設定関数
  // step: ±の増減量, redraw: 再描画コールバック
  makeEditRow(cx, y, label, get, set, step, redraw) {
    const objects = [];

    const minusBtn = this.add.text(cx - 52, y, '[-]', {
      fontSize: '15px', fill: '#ff8888', fontFamily: 'monospace',
      backgroundColor: '#2a1a1a', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    minusBtn.on('pointerdown', () => {
      const v = Math.max(1, get() - step);
      set(v);
      redraw();
    });

    const valText = this.add.text(cx, y, String(get()), {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const plusBtn = this.add.text(cx + 52, y, '[+]', {
      fontSize: '15px', fill: '#88ff88', fontFamily: 'monospace',
      backgroundColor: '#1a2a1a', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    plusBtn.on('pointerdown', () => {
      set(get() + step);
      redraw();
    });

    objects.push(minusBtn, valText, plusBtn);
    return objects;
  }

  // ── 共通：ナビゲーション用の◀▶ボタン ──
  makeNavBtn(x, y, label, onClick) {
    const btn = this.add.text(x, y, label, {
      fontSize: '18px', fill: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
    btn.on('pointerout',  () => btn.setStyle({ fill: '#aaaaaa' }));
    btn.on('pointerdown', onClick);
    return btn;
  }
}
