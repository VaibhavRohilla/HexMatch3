import { Easing, Tween } from "@tweenjs/tween.js";
import { collectRenderGroups, GlobalUniformSystem, Graphics} from "pixi.js";
import { GameData, Globals, LevelVar, powerUps } from "./Globals";

export class hexagons extends Graphics {
   
    isHandle : boolean = false;
    colorId : number = -1;
    hexagonId : number = -1;
    constructor(x: number, y: number, radius: number, isPickedcallback:( hexagons:hexagons) => void,isLeftCallback?:( hexagons:hexagons) => void) {
        super();
       
        this.zIndex = 3;
        const color = this.getRandomColor();
        
        this.drawHexagon(x, y, radius, color);
        this.colorId = color;
        this.setActive(true);


        this.on("pointerdown", () => {
            
            if(isPickedcallback&& !this.isHandle)
            {
                isPickedcallback(this);
                return;
            }
            if(powerUps.canHammer)
            {
                Globals.emitter?.Call("HammerActivated",this);
            }
            if(powerUps.canMoveHand)
                {
                    Globals.emitter?.Call("HandActivated",this);
                }
        })
        this.on("pointerup", () => {
            if(isLeftCallback)
            {
                this.setActive(false);
                isLeftCallback(this);
            }
        })
    }
    setActive(active : boolean)
    {
        if(active)
        {
            this.interactive = true;
            this.cursor = 'pointer';
        }
        else
        {
            this.interactive = false;
            this.cursor = '';
        }
    }

    destroyHexagon(callBack:()=>void,earnCoin : boolean){
        if(earnCoin)
        Globals.emitter?.Call("destroyCoin",{x:this.position.x,y:this.position.y});
    
        new Tween(this.scale,Globals
            .SceneManager?.tweenGroup
        )
        .to({x:0,y:0},500)
        .easing(Easing.generatePow(2).InOut)
        .onComplete(()=>{callBack();})
        .start();
    }
    drawHexagon(
      
        x: number,
        y: number,
        radius: number,
        fillColor: number
    ): void {
        const angleStep: number = Math.PI / 3; // 60 degrees
        // Set fill style
        this.setFillStyle(fillColor);
        // Begin path for the fill
        this.beginPath();
        this.moveTo(
            x + radius * Math.cos(0),
            y + radius * Math.sin(0)
        );
        for (let i = 1; i <= 6; i++) {
            this.lineTo(
                x + radius * Math.cos(i * angleStep),
                y + radius * Math.sin(i * angleStep)
            );
        }
        this.closePath();
        this.fill(); // Apply the fill
    }

    getRandomColor(): number {
        const limitedColors = colors.slice(0, GameData.CurrentColorLevel); // Limit the colors array to maxColors
        const randomIndex = Math.floor(Math.random() * limitedColors.length);
        return limitedColors[randomIndex];
    }
}


const colors = [
    0xea773a, // Red
    0x1dabe0, // Green
    0x7e419b, // Blue
    0x08c1b1, // White
    0xef4c61, // Yellow
    0xf6bf14, // Purple
];