import { Scene } from "./Scene";
import { LevelGenerator } from "./LevelGenerator";
import { UiContainer } from "./UIContainer";
import { GlobalUniformSystem, Sprite } from "pixi.js";
import { Globals } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";
import { hexagons } from "./Hexagon";
import { log } from "node:console";

export class MainScene extends Scene {

	lvlContainer : LevelGenerator = new LevelGenerator();
	UiContainer : UiContainer = new UiContainer();
 
  constructor() {
    super(0x191c28);

	  this.mainContainer.addChild(this.lvlContainer);
	  this.mainContainer.addChild(this.UiContainer);
  }
  destroyCoin(Pos : {x:number,y:number}){
    const pos = this.mainContainer.toLocal({x:Pos.x,y:Pos.y},this.lvlContainer);
    const coin = new Sprite(Globals.resources.Coin);
    coin.scale.set(0.3);
    coin.anchor.set(0.5);
    coin.position.set(pos.x,pos.y);
    this.mainContainer.addChild(coin);
    const startX = coin.position.x;
    const startY = coin.position.y;
    const endX = this.UiContainer.currentScoreText.position.x;
    const endY = this.UiContainer.currentScoreText.position.y;
    
    // Randomly decide the direction of the curve (upward or downward)
    const curveDirection = Math.random() < 0.5 ? 1 : -1; // 1 for up, -1 for down
    
    // Randomly choose a horizontal offset for more variability
    const horizontalOffset = Math.random() * 100 + 50; // Adjust 50-100 for desired range
    
    // Control point for the curve
    const controlX = (startX + endX) / 2 + (Math.random() < 0.5 ? -horizontalOffset : horizontalOffset);
    const controlY = ((startY + endY) / 2) + curveDirection * 100; // Adjust 100 for desired curvature
    
    let progress = { t: 0 }; // Progress from 0 to 1
    
    new Tween(progress, Globals.SceneManager?.tweenGroup)
      .to({ t: 1 }, 1000) // Duration of 1000 ms
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        // Use a quadratic Bézier curve formula
        const t = progress.t;
        coin.position.x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        coin.position.y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
      })
      .onComplete(() => {
        this.mainContainer.removeChild(coin);
        this.UiContainer.updateScore(3);

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
    this.lvlContainer.update(dt);
  }

  resetGame()
  {
    
  }
  /**
   * Handle received messages.
   */
  recievedMessage(msgType: string, msgParams: any): void {
    // Handle incoming messages
    if(msgType === "destroyCoin"){
   
      this.destroyCoin(msgParams);
    }
    if(msgType === "changeLevel"){
      this.lvlContainer.expandHexGrid();
    }
    
  }
}
