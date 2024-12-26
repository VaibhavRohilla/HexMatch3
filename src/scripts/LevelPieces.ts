import { Graphics } from "pixi.js";
import { hexagons } from "./Hexagon";
import { Globals, LevelVar } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";

export class LevelHexagons extends Graphics
{
    public q: number; // Axial coordinate q
    public r: number; // Axial coordinate r
    index : number = -1;
    hexagonPlaced : hexagons | undefined = undefined;
    constructor(pos: { x: number; y: number }, index: number, q: number, r: number) 
    {
        super();
        this.q = q;
        this.r = r;
        this.zIndex = 1;
        this.index = index;
        this.drawHexagon(
            this,
            LevelVar.HEX_RADIUS,
            LevelVar.FILL_COLOR
        );
        this.position.set(pos.x,pos.y);
        this.allowChildren = true;
        // const text = new TextLabel(0,0,0.5,index.toString(),20,0x000000)
        // this.addChild(text);

    }
 
    drawHexagon(
        graphics: Graphics,
        radius: number,
        fillColor: number
    ): void {
        const angleStep: number = Math.PI / 3; // 60 degrees

        // Set fill style
        graphics.setFillStyle(fillColor);

        // Begin path for the fill
        graphics.beginPath();
        graphics.moveTo(
            radius * Math.cos(0),
             radius * Math.sin(0)
        );
        for (let i = 1; i <= 6; i++) {
            graphics.lineTo(
                radius * Math.cos(i * angleStep),
                radius * Math.sin(i * angleStep)
            );
        }
        graphics.closePath();
        graphics.fill(); // Apply the fill
        // Set stroke style for the border

        this.scale.set(0);
        new Tween(this.scale, Globals.SceneManager?.tweenGroup)
            .to({ x: 1, y: 1 }, 1000)
            .easing(Easing.generatePow(4).InOut)    
            .start();
    }
    
}