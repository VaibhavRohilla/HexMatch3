import { Container, Graphics, GraphicsPath } from "pixi.js";
import { config } from "./appConfig";
import { TextLabel } from "./TextLabel";

export class GameOverPanel extends Container {
    constructor() {
        super();
        this.label = "GMP";
        this.position.set(0,0);
        
        this.addChild(this.addOverlay());

        const gameoverbg = new Graphics();
        gameoverbg.roundRect(0, 0, config.logicalWidth*0.9, config.logicalHeight*0.9, 20);
        gameoverbg.fill(0xbfcfff);
        gameoverbg.position.set(50 , 100);
        this.addChild(gameoverbg);

        const gameoverText = new TextLabel(gameoverbg.position.x + gameoverbg.width/2, gameoverbg.position.y + 50, 0.5, "Game Over", 50, 0x000000);
        this.addChild(gameoverText);
    }

    addOverlay() {
        const overlay = new Graphics();
        overlay.rect(-config.logicalWidth*1.5, 0, config.logicalWidth*4, config.logicalHeight*2);
        overlay.fill(0x000000);
        overlay.alpha = 0.3;
        overlay.interactive = true;
        return overlay;
    }
}