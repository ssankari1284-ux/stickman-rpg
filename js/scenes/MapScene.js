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

    // プレイヤー情報バー
    this.drawStatusBar();

    // マップのボタン一覧
    this.drawMapButtons(map);

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

    // MP バー
    const mpRate = p.mp / p.maxMp;
    g.fillStyle(0x444444, 1);
    g.fillRect(80, barY + 20, 200, 14);
    g.fillStyle(0x4488ff, 1);
    g.fillRect(80, barY + 20, 200 * mpRate, 14);

    // テキスト
    this.add.text(15, barY - 5, `Lv.${p.level}  ${p.name}`, {
      fontSize: '13px', fill: '#ffffff', fontFamily: 'monospace',
    });
    this.add.text(15, barY + 2, 'HP', { fontSize: '13px', fill: '#88ff88', fontFamily: 'monospace' });
    this.add.text(15, barY + 22, 'MP', { fontSize: '13px', fill: '#88aaff', fontFamily: 'monospace' });
    this.add.text(285, barY + 2, `${p.hp}/${p.maxHp}`, { fontSize: '12px', fill: '#ccffcc', fontFamily: 'monospace' });
    this.add.text(285, barY + 22, `${p.mp}/${p.maxMp}`, { fontSize: '12px', fill: '#aaccff', fontFamily: 'monospace' });
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

      this.createMapButton(x, y, node);
    });
  }

  // ボタンのX座標（列ごとに配置）
  getNodeX(col) {
    const positions = [120, 240, 360];
    return positions[col] || 240;
  }

  // 色付きボタンを1つ作る
  createMapButton(x, y, node) {
    const colors = {
      battle: { bg: 0xaa2222, text: '⚔ 戦闘', label: '赤' },
      shop:   { bg: 0x228822, text: '🛒 お店', label: '緑' },
      event:  { bg: 0xaaaa22, text: '！ イベント', label: '黄' },
      next:   { bg: 0x882288, text: '▶ 次へ', label: '紫' },
      prev:   { bg: 0x224488, text: '◀ 戻る', label: '青' },
    };

    const c = colors[node.type] || colors.battle;

    const g = this.add.graphics();
    g.fillStyle(c.bg, 1);
    g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);

    const btn = this.add.text(x, y, c.text, {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // 倒した敵は暗くする
    if (node.type === 'battle' && node.cleared) {
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      btn.setStyle({ fill: '#888888' });
      return;
    }

    btn.on('pointerover', () => {
      g.clear();
      g.fillStyle(c.bg, 1);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      g.lineStyle(3, 0xffffff, 1);
      g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);
    });

    btn.on('pointerout', () => {
      g.clear();
      g.fillStyle(c.bg, 1);
      g.fillRoundedRect(x - 60, y - 22, 120, 44, 8);
      g.lineStyle(2, 0xffffff, 0.5);
      g.strokeRoundedRect(x - 60, y - 22, 120, 44, 8);
    });

    btn.on('pointerdown', () => {
      this.handleNodeTap(node);
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
      // 今後：お店画面を追加
      this.showMessage('お店はまだ準備中です');
    } else if (node.type === 'event') {
      this.showMessage('イベントはまだ準備中です');
    }
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
      { type: 'battle', row: 0, col: 1, enemy: 'slime',  cleared: false },
      { type: 'battle', row: 1, col: 0, enemy: 'goblin', cleared: false },
      { type: 'shop',   row: 1, col: 2 },
      { type: 'battle', row: 2, col: 1, enemy: 'wolf',   cleared: false },
      { type: 'next',   row: 3, col: 1 },
    ],
  },
  {
    name: 'ステージ2：暗い森',
    nodes: [
      { type: 'battle', row: 0, col: 0, enemy: 'bat',    cleared: false },
      { type: 'battle', row: 0, col: 2, enemy: 'spider', cleared: false },
      { type: 'event',  row: 1, col: 1 },
      { type: 'battle', row: 2, col: 1, enemy: 'orc',    cleared: false },
      { type: 'prev',   row: 3, col: 0 },
      { type: 'next',   row: 3, col: 2 },
    ],
  },
];
