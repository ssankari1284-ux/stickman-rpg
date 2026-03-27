// タイトル画面
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = this.scale.width / 2;

    // 棒人間を描画する
    this.drawStickMan(cx, 200);

    // タイトル文字
    this.add.text(cx, 320, '棒人間RPG', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // サブタイトル
    this.add.text(cx, 375, '〜父を救え〜', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // スタートボタン
    const startBtn = this.add.text(cx, 460, '► はじめる', {
      fontSize: '22px',
      fill: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#444466',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // ボタンにマウスを乗せたとき
    startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#ffff00' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#ffffff' }));

    // ボタンをクリックしたらマップ画面へ
    startBtn.on('pointerdown', () => {
      this.scene.start('MapScene');
    });

    // 点滅するテキスト
    const tapText = this.add.text(cx, 540, 'タップしてスタート', {
      fontSize: '14px',
      fill: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: tapText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  // 棒人間を線で描く
  drawStickMan(x, y) {
    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff, 1);

    // 頭（丸）
    g.strokeCircle(x, y - 50, 25);
    // 胴体
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 25, x, y + 30));
    // 左腕
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 10, x - 35, y + 10));
    // 右腕（剣を持っている）
    g.strokeLineShape(new Phaser.Geom.Line(x, y - 10, x + 35, y - 20));
    // 剣
    g.lineStyle(4, 0xffdd00, 1);
    g.strokeLineShape(new Phaser.Geom.Line(x + 35, y - 20, x + 65, y - 45));
    g.lineStyle(4, 0xffffff, 1);
    // 左足
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 30, x - 25, y + 70));
    // 右足
    g.strokeLineShape(new Phaser.Geom.Line(x, y + 30, x + 25, y + 70));
  }
}
