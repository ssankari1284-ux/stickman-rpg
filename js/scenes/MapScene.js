// マップ画面
class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    const cx = this.scale.width / 2;
    const w = this.scale.width;

    // マップデータ（現在のステージ）
    this.mapIndex = playerData.currentMap;
    const map = mapList[this.mapIndex];

    // 背景タイトル
    this.add.text(cx, 30, map.name, {
      fontSize: '22px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ノード間の接続線（ボタンより先に描くことで背面に表示される）
    this.drawConnectionLines(map);

    // マップのボタン一覧
    this.drawMapButtons(map);

    // 最初に押すべきノードを点滅ハイライト
    this.drawStartIndicator(map);

    // 凡例（ノードの種類説明）
    this.drawLegend();

    // プレイヤー情報バー
    this.drawStatusBar();

    // メニューボタン（右上）
    const menuBtn = this.add.text(w - 20, 20, '≡ メニュー', {
      fontSize: '16px',
      fill: '#ccccff',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  // ノード間に接続線を描く
  drawConnectionLines(map) {
    const startY = 100;
    const spacing = 80;
    const lines = this.add.graphics().setDepth(0);

    map.nodes.forEach((node) => {
      if (!node.connects || node.connects.length === 0) return;

      const sx = this.getNodeX(node.col);
      const sy = startY + node.row * spacing;

      node.connects.forEach((targetIndex) => {
        const target = map.nodes[targetIndex];
        if (!target) return;

        const tx = this.getNodeX(target.col);
        const ty = startY + target.row * spacing;

        // クリア済み接続は明るく、未クリアは暗く
        const isCleared = node.cleared || node.type === 'shop' || node.type === 'event';
        const color = isCleared ? 0x6666aa : 0x444466;
        const alpha = isCleared ? 0.8 : 0.5;

        lines.lineStyle(2, color, alpha);
        lines.beginPath();
        lines.moveTo(sx, sy + 22);
        lines.lineTo(tx, ty - 22);
        lines.strokePath();

        // 矢印の先端（小さな「V」型）
        const angle = Math.atan2(ty - sy, tx - sx);
        const arrowLen = 8;
        const arrowAngle = 0.45;
        lines.lineStyle(2, color, alpha);
        lines.beginPath();
        lines.moveTo(tx, ty - 22);
        lines.lineTo(
          tx - arrowLen * Math.cos(angle - arrowAngle),
          ty - 22 - arrowLen * Math.sin(angle - arrowAngle)
        );
        lines.strokePath();
        lines.beginPath();
        lines.moveTo(tx, ty - 22);
        lines.lineTo(
          tx - arrowLen * Math.cos(angle + arrowAngle),
          ty - 22 - arrowLen * Math.sin(angle + arrowAngle)
        );
        lines.strokePath();
      });
    });
  }

  // プレイヤーのステータスバーを表示
  drawStatusBar() {
    const p = playerData;
    const barY = 580;

    // 背景
    const g = this.add.graphics();
    g.fillStyle(0x222244, 1);
    g.fillRect(10, barY - 10, this.scale.width - 20, 70);
    g.lineStyle(2, 0x4444aa, 1);
    g.strokeRect(10, barY - 10, this.scale.width - 20, 70);

    // HP バー
    const hpRate = p.hp / p.maxHp;
    g.fillStyle(0x444444, 1);
    g.fillRect(80, barY, 200, 14);
    g.fillStyle(hpRate > 0.5 ? 0x44cc44 : hpRate > 0.25 ? 0xffaa00 : 0xff4444, 1);
    g.fillRect(80, barY, 200 * hpRate, 14);

    // SP バー
    const mpRate = p.sp / p.maxSp;
    g.fillStyle(0x444444, 1);
    g.fillRect(80, barY + 20, 200, 14);
    g.fillStyle(0x4488ff, 1);
    g.fillRect(80, barY + 20, 200 * mpRate, 14);

    // テキスト
    this.add.text(15, barY - 5, `Lv.${p.level}  ${p.name}`, {
      fontSize: '13px', fill: '#ffffff', fontFamily: 'monospace',
    });
    this.add.text(15, barY + 2, 'HP', { fontSize: '13px', fill: '#88ff88', fontFamily: 'monospace' });
    this.add.text(15, barY + 22, 'SP', { fontSize: '13px', fill: '#88aaff', fontFamily: 'monospace' });
    this.add.text(285, barY + 2, `${p.hp}/${p.maxHp}`, { fontSize: '12px', fill: '#ccffcc', fontFamily: 'monospace' });
    this.add.text(285, barY + 22, `${p.sp}/${p.maxSp}`, { fontSize: '12px', fill: '#aaccff', fontFamily: 'monospace' });
    this.add.text(380, barY, `コイン\n${p.coins}`, {
      fontSize: '13px', fill: '#ffdd44', fontFamily: 'monospace', align: 'center',
    }).setOrigin(0.5, 0);
  }

  // マップのボタンを配置する
  drawMapButtons(map) {
    const startY = 100;
    const spacing = 80;

    map.nodes.forEach((node, i) => {
      const x = this.getNodeX(node.col);
      const y = startY + node.row * spacing;

      this.createMapButton(x, y, node, map);
    });
  }

  // ボタンのX座標（列ごとに配置）
  getNodeX(col) {
    const positions = [120, 240, 360];
    return positions[col] || 240;
  }

  // ノードが現在ロック（押せない）状態かどうかを判定する
  isNodeLocked(node, map) {
    // 次へ・戻るは全ての戦闘・イベントをクリアするまでロック
    if (node.type === 'next' || node.type === 'prev') {
      return map.nodes.some(n =>
        (n.type === 'battle' || n.type === 'event') && !n.cleared
      );
    }
    // 親ノード（このノードをconnectsに持つノード）を探す
    const parents = map.nodes.filter(n => n.connects && n.connects.includes(map.nodes.indexOf(node)));
    // 親がいない（row 0）は常にアンロック
    if (parents.length === 0) return false;
    // 親が1つもクリアされていなければロック
    return !parents.some(p => p.cleared);
  }

  // 色付きボタンを1つ作る
  createMapButton(x, y, node, map) {
    const colors = {
      battle: { bg: 0xaa2222, text: '⚔ 戦闘', label: '赤' },
      shop:   { bg: 0x228822, text: '🛒 お店', label: '緑' },
      event:  { bg: 0xaaaa22, text: '！ イベント', label: '黄' },
      next:   { bg: 0x882288, text: '▶ 次へ', label: '紫' },
      prev:   { bg: 0x224488, text: '◀ 戻る', label: '青' },
    };

    const c = colors[node.type] || colors.battle;
    const isLocked = this.isNodeLocked(node, map);

    const g = this.add.graphics().setDepth(1);
    const alpha = isLocked ? 0.3 : 1;
    g.fillStyle(c.bg, alpha);
    g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
    g.lineStyle(2, 0xffffff, isLocked ? 0.15 : 0.5);
    g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);

    // ロック中のノード
    if (isLocked) {
      this.add.text(x, y, '🔒 ロック中', {
        fontSize: '12px',
        fill: '#555555',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(2);
      return;
    }

    // クリア済みの戦闘ノード：「再戦」として押せる状態を維持
    if (node.type === 'battle' && node.cleared) {
      g.fillStyle(c.bg, 0.55);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      g.lineStyle(2, 0xffffff, 0.25);
      g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);

      const btn = this.add.text(x, y, '⚔ 再戦', {
        fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);

      // クリア済みマーク（右上）
      this.add.text(x + 52, y - 18, '✓', {
        fontSize: '11px', fill: '#44ff44', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(3);

      btn.on('pointerover', () => {
        g.clear();
        g.fillStyle(c.bg, 0.85);
        g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
        g.lineStyle(2, 0xffffff, 0.7);
        g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);
        btn.setStyle({ fill: '#ffffff' });
      });
      btn.on('pointerout', () => {
        g.clear();
        g.fillStyle(c.bg, 0.55);
        g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
        g.lineStyle(2, 0xffffff, 0.25);
        g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);
        btn.setStyle({ fill: '#aaaaaa' });
      });
      btn.on('pointerdown', () => this.handleNodeTap(node));
      return;
    }

    // クリア済みのイベント・ショップ：再訪不可（暗く表示）
    if ((node.type === 'event' || node.type === 'shop') && node.cleared) {
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      this.add.text(x, y, c.text, {
        fontSize: '14px', fill: '#555555', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(2);
      this.add.text(x + 52, y - 18, '✓', {
        fontSize: '11px', fill: '#44ff44', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(3);
      return;
    }

    const btn = this.add.text(x, y, c.text, {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);

    btn.on('pointerover', () => {
      g.clear();
      g.fillStyle(c.bg, 1);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      g.lineStyle(3, 0xffffff, 1);
      g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);

      // 戦闘ノードはホバー時に敵の情報を表示
      if (node.type === 'battle' && node.enemy) {
        const info = enemyData[node.enemy];
        if (info) {
          const tipLabel = `${info.name}\nHP:${info.maxHp} ATK:${info.attack}`;
          // row 0 は上が狭いのでツールチップを下に表示
          const tipY = node.row === 0 ? y + 44 : y - 44;
          const tipBg = this.add.graphics().setDepth(10);
          tipBg.fillStyle(0x000000, 0.85);
          tipBg.fillRoundedRect(x - 64, tipY - 16, 128, 36, 4);
          tipBg.lineStyle(1, 0xffaa44, 0.8);
          tipBg.strokeRoundedRect(x - 64, tipY - 16, 128, 36, 4);
          const tipText = this.add.text(x, tipY, tipLabel, {
            fontSize: '11px', fill: '#ffddaa', fontFamily: 'monospace', align: 'center',
          }).setOrigin(0.5).setDepth(11);
          btn._tipBg = tipBg;
          btn._tipText = tipText;
        }
      }
    });

    btn.on('pointerout', () => {
      g.clear();
      g.fillStyle(c.bg, 1);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      g.lineStyle(2, 0xffffff, 0.5);
      g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);

      if (btn._tipBg) { btn._tipBg.destroy(); btn._tipBg = null; }
      if (btn._tipText) { btn._tipText.destroy(); btn._tipText = null; }
    });

    btn.on('pointerdown', () => {
      this.handleNodeTap(node);
    });
  }

  // 最初に押すべきノードを黄色枠で点滅させる
  drawStartIndicator(map) {
    const startY = 100;
    const spacing = 80;

    // ロックされておらず、かつクリアされていないノードを全て探す
    const availableNodes = map.nodes.filter(node =>
      !this.isNodeLocked(node, map) &&
      !(node.type === 'battle' && node.cleared) &&
      node.type !== 'next' && node.type !== 'prev'
    );

    availableNodes.forEach(node => {
      const x = this.getNodeX(node.col);
      const y = startY + node.row * spacing;

      const glow = this.add.graphics().setDepth(1);
      glow.lineStyle(3, 0xffff00, 1);
      glow.strokeRoundedRect(x - 67, y - 29, 134, 58, 10);

      this.tweens.add({
        targets: glow,
        alpha: { from: 1, to: 0.2 },
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.easeInOut',
      });
    });
  }

  // 凡例（ノード種類の説明）を表示する
  drawLegend() {
    const lx = 8;
    const ly = 52;
    const lw = 108;
    const lh = 80;

    const bg = this.add.graphics().setDepth(3);
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(lx, ly, lw, lh, 4);
    bg.lineStyle(1, 0x444466, 1);
    bg.strokeRoundedRect(lx, ly, lw, lh, 4);

    const items = [
      { dot: '#ff6666', label: '⚔ 戦闘' },
      { dot: '#66ff66', label: '🛒 お店' },
      { dot: '#ffff66', label: '！ イベント' },
      { dot: '#cc88ff', label: '▶ 次のステージ' },
      { dot: '#888888', label: '✓ クリア済み' },
    ];

    this.add.text(lx + 6, ly + 3, '凡例', {
      fontSize: '10px', fill: '#aaaacc', fontFamily: 'monospace',
    }).setDepth(3);

    items.forEach((item, i) => {
      this.add.text(lx + 6, ly + 16 + i * 13, item.label, {
        fontSize: '10px', fill: item.dot, fontFamily: 'monospace',
      }).setDepth(3);
    });
  }

  // ボタンを押したときの処理
  handleNodeTap(node) {
    if (node.type === 'battle') {
      this.scene.start('BattleScene', { node: node, mapIndex: this.mapIndex });
    } else if (node.type === 'next') {
      playerData.currentMap = Math.min(playerData.currentMap + 1, mapList.length - 1);
      this.scene.restart();
    } else if (node.type === 'prev') {
      playerData.currentMap = Math.max(playerData.currentMap - 1, 0);
      this.scene.restart();
    } else if (node.type === 'shop') {
      node.cleared = true; // 訪問済みにしてロック解放
      this.scene.start('ShopScene', { mapIndex: this.mapIndex });
    } else if (node.type === 'event') {
      this.showEvent(node);
    }
  }

  // イベント発生：ランダムなイベントをオーバーレイで表示
  showEvent(node) {
    const cx = this.scale.width / 2;

    const eventTypes = [
      {
        icon: '💰', name: '宝箱を発見！',
        desc: '古びた宝箱がひっそりと\n置かれていた。',
        choices: [
          { label: '開ける', apply: () => { playerData.coins += 30; return 'コイン +30 を得た！'; } },
        ],
      },
      {
        icon: '💧', name: '癒しの泉',
        desc: '透き通った泉がある。\n飲んでみようか？',
        choices: [
          { label: '飲む',    apply: () => { playerData.hp = playerData.maxHp; playerData.sp = playerData.maxSp; return 'HP・SPが全回復した！'; } },
          { label: '飲まない', apply: () => '先を急いだ。' },
        ],
      },
      {
        icon: '🗿', name: '謎の像',
        desc: '怪しい像が立っている。\n触れると何かが起きそうだ…',
        choices: [
          { label: '触れる', apply: () => {
            if (Phaser.Math.Between(0, 1)) { playerData.attack += 2; return '力がみなぎった！ 攻撃力 +2'; }
            else { playerData.hp = Math.max(1, playerData.hp - 15); return 'のろいを受けた！ HP -15'; }
          }},
          { label: '無視する', apply: () => '何もしなかった。' },
        ],
      },
      {
        icon: '🏕', name: '休憩所',
        desc: '木陰に小さな休憩所がある。\n休んでいくか？',
        choices: [
          { label: '休む（5コイン）', apply: () => {
            if (playerData.coins >= 5) {
              playerData.coins -= 5;
              const heal = Math.floor(playerData.maxHp * 0.5);
              playerData.hp = Math.min(playerData.maxHp, playerData.hp + heal);
              return `HP +${heal} 回復！ コイン -5`;
            }
            return 'コインが足りない…';
          }},
          { label: 'スルー', apply: () => '先を急いだ。' },
        ],
      },
    ];

    const ev = eventTypes[Phaser.Math.Between(0, eventTypes.length - 1)];
    const panelX = cx - 165;
    const panelY = 160;
    const panelW = 330;
    const panelH = 280;
    const toDestroy = [];

    // 半透明の黒背景
    const dimBg = this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x000000, 0.72).setDepth(20).setInteractive();
    toDestroy.push(dimBg);

    // パネル
    const panel = this.add.graphics().setDepth(21);
    panel.fillStyle(0x111133, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panel.lineStyle(2, 0x8866cc, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    toDestroy.push(panel);

    // イベント名
    toDestroy.push(this.add.text(cx, panelY + 22, `${ev.icon} ${ev.name}`, {
      fontSize: '16px', fill: '#ffff88', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(22));

    // 説明文
    toDestroy.push(this.add.text(cx, panelY + 62, ev.desc, {
      fontSize: '13px', fill: '#cccccc', fontFamily: 'monospace', align: 'center',
    }).setOrigin(0.5).setDepth(22));

    // 結果テキスト（選択後に表示）
    const resultText = this.add.text(cx, panelY + 155, '', {
      fontSize: '14px', fill: '#88ff88', fontFamily: 'monospace', align: 'center',
    }).setOrigin(0.5).setDepth(22);
    toDestroy.push(resultText);

    // 選択肢ボタン
    const choiceBtnObjs = [];
    const choiceStartY = ev.choices.length === 1 ? panelY + 140 : panelY + 115;

    ev.choices.forEach((choice, i) => {
      const by = choiceStartY + i * 44;
      const cbg = this.add.graphics().setDepth(22);
      cbg.fillStyle(0x334466, 1);
      cbg.fillRoundedRect(cx - 110, by - 14, 220, 28, 6);

      const cb = this.add.text(cx, by, choice.label, {
        fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(23);

      cb.on('pointerdown', () => {
        const msg = choice.apply();
        resultText.setText(msg);

        // 選択肢を非表示にする
        choiceBtnObjs.forEach(({ bg, btn }) => { bg.setVisible(false); btn.setVisible(false); });

        // イベントノードをクリア済みにする
        node.cleared = true;

        // 閉じるボタンを表示
        const closeBg = this.add.graphics().setDepth(22);
        closeBg.fillStyle(0x335533, 1);
        closeBg.fillRoundedRect(cx - 60, panelY + 222, 120, 28, 6);
        const closeBtn = this.add.text(cx, panelY + 236, '閉じる', {
          fontSize: '14px', fill: '#aaffaa', fontFamily: 'monospace',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(23);

        closeBtn.on('pointerdown', () => {
          toDestroy.forEach(o => o.destroy());
          choiceBtnObjs.forEach(({ bg, btn }) => { bg.destroy(); btn.destroy(); });
          closeBg.destroy();
          closeBtn.destroy();
          this.scene.restart(); // マップを再描画してクリア済みを反映
        });
      });

      choiceBtnObjs.push({ bg: cbg, btn: cb });
      toDestroy.push(cbg, cb);
    });
  }

  // 簡易メッセージ表示
  showMessage(text) {
    const cx = this.scale.width / 2;
    const msg = this.add.text(cx, 320, text, {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(10);

    this.time.delayedCall(2000, () => msg.destroy());
  }
}

// マップデータ一覧
const mapList = [
  {
    name: 'ステージ1：草原の道',
    nodes: [
      { type: 'battle', row: 0, col: 1, enemy: 'slime',  cleared: false, connects: [1, 2] },
      { type: 'battle', row: 1, col: 0, enemy: 'goblin', cleared: false, connects: [3] },
      { type: 'shop',   row: 1, col: 2,                  connects: [3] },
      { type: 'battle', row: 2, col: 1, enemy: 'wolf',   cleared: false, connects: [4] },
      { type: 'next',   row: 3, col: 1,                  connects: [] },
    ],
  },
  {
    name: 'ステージ2：暗い森',
    nodes: [
      { type: 'battle', row: 0, col: 0, enemy: 'bat',    cleared: false, connects: [2] },
      { type: 'battle', row: 0, col: 2, enemy: 'spider', cleared: false, connects: [2] },
      { type: 'event',  row: 1, col: 1,                  connects: [3] },
      { type: 'battle', row: 2, col: 1, enemy: 'orc',    cleared: false, connects: [4, 5] },
      { type: 'prev',   row: 3, col: 0,                  connects: [] },
      { type: 'next',   row: 3, col: 2,                  connects: [] },
    ],
  },
];
