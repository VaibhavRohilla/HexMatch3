import { Scene } from "./Scene";
import { LevelGenerator } from "./LevelGenerator";
import { UiContainer } from "./UIContainer";
import { GlobalUniformSystem, Sprite } from "pixi.js";
import { GameData, Globals, LevelVar, powerUps } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";
import { hexagons } from "./Hexagon";
import { log } from "node:console";
import { GameOverPanel } from "./GameOverPanel";
import { config } from "./appConfig";
import { report } from "node:process";

export class MainScene extends Scene {

  lvlContainer: LevelGenerator = new LevelGenerator();
  UiContainer: UiContainer = new UiContainer();

  constructor() {
    super(0x191c28);

    this.mainContainer.addChild(this.lvlContainer);
    // this.mainContainer.addChild(new GameOverPanel());    
    this.mainContainer.addChild(this.UiContainer);
  }


  destroyCoin(Pos: { x: number, y: number }) {
    const pos = this.mainContainer.toLocal({ x: Pos.x, y: Pos.y }, this.lvlContainer);
    const coin = new Sprite(Globals.resources.Coin);
    coin.scale.set(0.3);
    coin.anchor.set(0.5);
    coin.position.set(pos.x, pos.y);
    this.mainContainer.addChild(coin);
    const startX = coin.position.x;
    const startY = coin.position.y;

    const endX = config.logicalWidth - 245;
    const endY = 150;

    // Randomly decide the direction of the curve (upward or downward)
    const curveDirection = Math.random() < 0.5 ? 1 : -1; // 1 for up, -1 for down

    // Randomly choose a horizontal offset for more variability
    const horizontalOffset = Math.random() * 100 + 50; // Adjust 50-100 for desired range

    // Control point for the curve
    const controlX = (startX + endX) / 2 + (Math.random() < 0.5 ? -horizontalOffset : horizontalOffset);
    const controlY = ((startY + endY) / 2) + curveDirection * 100; // Adjust 100 for desired curvature

    let progress = { t: 0 }; // Progress from 0 to 1
    const time = Math.random() < 0.5 ? 1000 : 800
    new Tween(progress, Globals.SceneManager?.tweenGroup)
      .to({ t: 1 }, time) // Duration of 1000 ms
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        // Use a quadratic Bézier curve formula
        const t = progress.t;
        coin.position.x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        coin.position.y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
      })
      .onComplete(() => {
        this.mainContainer.removeChild(coin);
        this.UiContainer.updateScore(1);

      })
      .start();

  }
  /**
   * Resize event handler.
   */
  resize(): void {
    super.resize();
  }

  /**
   * Update function called every frame.
   */
  update(dt: number): void {
    // Perform updates for the scene
    if (!LevelVar.isGameOver)
      this.lvlContainer.update(dt);
  }

  resetGame() {
    console.log("_________________Reset Game____________________________");

    LevelVar.HEX_RADIUS = 45;
    LevelVar.HEX_ROWS = 2;
    LevelVar.FILL_COLOR = 0x353a50;
    LevelVar.HEX_SPACING = 40;
    LevelVar.hexGap = 10;
    LevelVar.hexSpawnTime = 1700;
    GameData.CurrentColorLevel = 3;
    LevelVar.isGameOver = false;
    GameData.canChangeLevel = true;
    GameData.CurrentScore = 0;
    this.mainContainer.removeChild(this.UiContainer);
    this.UiContainer = new UiContainer();
    this.mainContainer.addChild(this.UiContainer);
    this.mainContainer.removeChild(this.lvlContainer);
    this.lvlContainer = new LevelGenerator();
    this.mainContainer.addChild(this.lvlContainer);
  }

  checkForGameOver() {
    const availableHexes = this.lvlContainer.hexPieces.filter(hex => !hex.hexagonPlaced);
    if (availableHexes.length === 0) {
      LevelVar.isGameOver = true;
      this.resetGame();
    }
  }
  /**
   * Handle received messages.
   */
  recievedMessage(msgType: string, msgParams: any): void {
    // Handle incoming messages
    if (msgType === "destroyCoin") {
      this.destroyCoin(msgParams);
    }
    if (msgType === "gameOver") {
      LevelVar.isGameOver = true;
      this.resetGame();
    }
    if (msgType === "changeLevel") {
      this.lvlContainer.expandHexGrid();
    }
    if (msgType === "ActivateHande") {
      this.UiContainer.updateCurrentMoney(-parseInt(this.UiContainer.handBtn.price.text))
    }
    if (msgType === "ActivateReverse") {
      if (this.lvlContainer.reverseMove())
        this.UiContainer.updateCurrentMoney(-parseInt(this.UiContainer.reverseBtn.price.text))
      else
        this.UiContainer.reverseBtn.price.updateLabelText((parseInt(this.UiContainer.reverseBtn.price.text) - 20).toString());
    }
    if (msgType === "canHammer") {
      if (this.activatePowerup()) {
        powerUps.canHammer = true;
        LevelVar.isGameOver = true;
        this.UiContainer.updateCurrentMoney(-parseInt(this.UiContainer.hammerBtn.price.text));
        this.UiContainer.reverseBtn.setActive(false);
        this.UiContainer.handBtn.setActive(false);
      }
      else
        this.UiContainer.reverseBtn.price.updateLabelText((parseInt(this.UiContainer.hammerBtn.price.text) - 20).toString());
    }
    if (msgType === "HammerActivated") {
      const piece = msgParams;
      console.log("ActivateHammer", this.lvlContainer.hexPieces[piece.hexagonId]);
      this.lvlContainer.hammerItUp(this.lvlContainer.hexPieces[piece.hexagonId]);
    }
    if (msgType === "canUsePowerUps") {
      this.UiContainer.hammerBtn.setActive(true);
      this.UiContainer.reverseBtn.setActive(true);
      this.UiContainer.handBtn.setActive(true);
      powerUps.canHammer = false;
      powerUps.canMoveHand = false;

    }
    if (msgType === "canUseHand") {
      if (this.activatePowerup()) {
        powerUps.canMoveHand = true;
        LevelVar.isGameOver = true;
        this.UiContainer.updateCurrentMoney(-parseInt(this.UiContainer.hammerBtn.price.text));
        this.UiContainer.reverseBtn.setActive(false);
        this.UiContainer.handBtn.setActive(false);
      }
      else
        this.UiContainer.reverseBtn.price.updateLabelText((parseInt(this.UiContainer.hammerBtn.price.text) - 20).toString());
    }
    if (msgType === "HandActivated") {
      const piece = this.lvlContainer.hexPieces[msgParams.hexagonId];
      if (piece.hexagonPlaced)
        piece.hexagonPlaced.destroyHexagon(() => {
          if (piece.hexagonPlaced)
            this.lvlContainer.removeChild(piece.hexagonPlaced);
          Globals.emitter?.Call("canUsePowerUps");
          LevelVar.isGameOver = false;
        }, false);

      piece.hexagonPlaced = undefined;
    }

  }
  activatePowerup(): boolean {
    let canUse: boolean = false;
    this.lvlContainer.hexPieces.forEach(element => {
      if (!element.hexagonPlaced) return;
      console.log(element);

      element.hexagonPlaced.setActive(true);
      canUse = true;

    });
    return canUse;
  }
}
