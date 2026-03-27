// お店画面
class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data) {
    this.mapIndex = data.mapIndex;
  }

  create() {
    const cx = this.scale.width / 2;
    const p = playerData;

    // 背景
    this.add.rectangle(cx, 320, this.scale.width, this.scale.height, 0x0d1a0d);

    // タイトル
    this.add.text(cx, 25, '🛒 お店', {
      fontSize: '24px', fill: '#88ff88', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 所持コイン（更新対象）
    this.coinsText = this.add.text(cx, 58, `所持コイン：${p.coins}`, {
      fontSize: '16px', fill: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 仕切り線
    const g = this.add.graphics();
    g.lineStyle(1, 0x226622, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 80, this.scale.width - 10, 80));

    // 商品リスト
    shopStock.forEach((item, i) => {
      this.createShopRow(item, 20, 98 + i * 88);
    });

    // マップへ戻るボタン
    const backBtn = this.add.text(cx, 590, '◀ マップへ戻る', {
      fontSize: '17px', fill: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#334466', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00' }));
    backBtn.on('pointerout',  () => backBtn.setStyle({ fill: '#ffffff' }));
    backBtn.on('pointerdown', () => this.scene.start('MapScene'));
  }

  // 商品1行分を作る
  createShopRow(item, x, y) {
    const p = playerData;
    const g = this.add.graphics();

    // 背景ボックス
    g.fillStyle(0x112211, 1);
    g.fillRoundedRect(x, y, this.scale.width - x * 2, 78, 6);
    g.lineStyle(1, 0x334433, 1);
    g.strokeRoundedRect(x, y, this.scale.width - x * 2, 78, 6);

    // 商品名
    this.add.text(x + 12, y + 10, item.name, {
      fontSize: '15px', fill: '#aaffaa', fontFamily: 'monospace',
    });

    // 説明文
    this.add.text(x + 12, y + 32, item.desc, {
      fontSize: '12px', fill: '#888888', fontFamily: 'monospace',
    });

    // 価格
    this.add.text(x + 12, y + 52, `💰 ${item.cost} コイン`, {
      fontSize: '13px', fill: '#ffdd44', fontFamily: 'monospace',
    });

    // 在庫/購入済みチェック
    const alreadyBought = item.type === 'permanent' && p.boughtItems[item.id];
    const currentQty = item.type === 'consumable'
      ? (p.items.find(i => i.id === item.id) || { qty: 0 }).qty
      : 0;
    const maxReached = item.type === 'consumable' && currentQty >= item.maxQty;

    // 購入ボタン
    const canBuy = !alreadyBought && !maxReached;
    const btnLabel = alreadyBought ? '購入済み' : maxReached ? `所持上限(${item.maxQty})` : '購入する';
    const btnColor = canBuy ? '#44ffaa' : '#555555';
    const btnBgColor = canBuy ? 0x1a3a2a : 0x222222;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(btnBgColor, 1);
    btnBg.fillRoundedRect(this.scale.width - x - 130, y + 24, 120, 28, 6);

    const btn = this.add.text(this.scale.width - x - 70, y + 38, btnLabel, {
      fontSize: '13px', fill: btnColor, fontFamily: 'monospace',
    }).setOrigin(0.5);

    if (canBuy) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ fill: '#aaffcc' }));
      btn.on('pointerout',  () => btn.setStyle({ fill: '#44ffaa' }));
      btn.on('pointerdown', () => {
        if (p.coins < item.cost) {
          this.showMsg('コインが足りません！');
          return;
        }
        p.coins -= item.cost;
        this.coinsText.setText(`所持コイン：${p.coins}`);

        if (item.type === 'consumable') {
          // 所持品に追加（すでにあれば個数を増やす）
          const existing = p.items.find(i => i.id === item.id);
          if (existing) {
            existing.qty++;
          } else {
            p.items.push({ id: item.id, qty: 1 });
          }
          this.showMsg(`${item.name} を買った！`);
          // ボタンを再チェック（上限に達したら無効化）
          const newQty = p.items.find(i => i.id === item.id).qty;
          if (newQty >= item.maxQty) {
            btn.removeInteractive();
            btn.setStyle({ fill: '#555555' });
            btn.setText(`所持上限(${item.maxQty})`);
            btnBg.clear();
            btnBg.fillStyle(0x222222, 1);
            btnBg.fillRoundedRect(this.scale.width - x - 130, y + 24, 120, 28, 6);
          }
        } else if (item.type === 'permanent') {
          // 永続効果を即座に適用
          item.effect(p);
          p.boughtItems[item.id] = true;
          btn.removeInteractive();
          btn.setStyle({ fill: '#555555' });
          btn.setText('購入済み');
          btnBg.clear();
          btnBg.fillStyle(0x222222, 1);
          btnBg.fillRoundedRect(this.scale.width - x - 130, y + 24, 120, 28, 6);
          this.showMsg(`${item.name} の効果が発動した！`);
        }
      });
    }
  }

  // メッセージを一時表示
  showMsg(text) {
    const cx = this.scale.width / 2;
    const msg = this.add.text(cx, 555, text, {
      fontSize: '14px', fill: '#ffff44', fontFamily: 'monospace',
      backgroundColor: '#222200', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    this.time.delayedCall(1800, () => msg.destroy());
  }
}

// お店の商品リスト
const shopStock = [
  {
    id: 'potion',
    name: '回復薬',
    desc: '戦闘中に使うと HP+30回復する',
    cost: 30,
    maxQty: 5,
    type: 'consumable',
  },
  {
    id: 'hiPotion',
    name: '上回復薬',
    desc: '戦闘中に使うと HPを全回復する',
    cost: 80,
    maxQty: 3,
    type: 'consumable',
  },
  {
    id: 'ether',
    name: 'エーテル',
    desc: '戦闘中に使うと SP+15回復する',
    cost: 40,
    maxQty: 5,
    type: 'consumable',
  },
  {
    id: 'powerStone',
    name: '力の石',
    desc: '即座に 攻撃力を永続+2する',
    cost: 120,
    maxQty: 1,
    type: 'permanent',
    effect: (p) => { p.attack += 2; },
  },
  {
    id: 'guardStone',
    name: '守りの石',
    desc: '即座に 防御力を永続+2する',
    cost: 100,
    maxQty: 1,
    type: 'permanent',
    effect: (p) => { p.defense += 2; },
  },
];
