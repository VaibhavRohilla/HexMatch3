import {  GlobalUniformSystem, Graphics, Sprite, Texture } from "pixi.js";
import { TextLabel } from "./TextLabel";
import { GameData, Globals, LevelVar } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";


export class Button extends Graphics {
    imageTexture: Sprite;
    price : TextLabel;
    multiplier : number = 1;

    constructor(texture: Texture| undefined,scale : number,currentPrice : number, position: { x: number, y: number },CallBack : ()=> void,public canSetActive : boolean ) {
        super(texture);
        this.roundRect(0,0,150,150,20);
        this.allowChildren =true;
        this.stroke({color:LevelVar.FILL_COLOR,width:5});
        this.fill(0x3A3D4A);
        this.position.set(position.x, position.y);
        this.pivot.set(this.width/2,this.height/2);

        this.imageTexture  = new Sprite(texture);
        this.imageTexture.anchor.set(0.5);
        this.imageTexture.scale.set(scale);
        this.imageTexture.position.set(this.width/2,this.height/2);
        this.addChild(this.imageTexture);

        const coin  = new Sprite(Globals.resources.Coin);
        coin.anchor.set(0.5);
        coin.scale.set(0.2);
        coin.position.set(this.width*0.8,this.height*0.8);
        this.addChild(coin);

        this.price = new TextLabel(coin.position.x + coin.width,coin.position.y,0,currentPrice.toString(),40,0xFFFFFF);
        this.price.anchor.set(0,0.5);
        this.addChild(this.price);
        this.setActive(true);
        this.on("pointerdown", () => {
            if(GameData.Money >= parseInt(this.price.text))
            {
                this.tweenButton();
                CallBack();
                this.increaseMultiplier();
            }
            else
            this.tweenFalse();


            return;
        })
        
    }
    increaseMultiplier()
    {
        const currentPrice = parseInt(this.price.text) + 20;
        this.price.updateLabelText(currentPrice.toString());
    }

    tweenButton()
    {   
        this.setActive(false);
        new Tween(this.scale, Globals.SceneManager?.tweenGroup)
        .to({x:0.8,y:0.8},300)
        .easing(Easing.Back.Out)
        .repeat(1)
        .yoyo(true)
        .onComplete(()=>{if(this.canSetActive)this.setActive(true)})
        .start();
    }   
    tweenFalse()
    {
        this.setActive(false);

        const idlePosition = this.position.x;

        const idleTween =  new Tween(this.position, Globals.SceneManager?.tweenGroup)
        .to({x:idlePosition },100)
        .easing(Easing.Sinusoidal.InOut)
        .onComplete(()=>{this.setActive(true)})

        new Tween(this.position, Globals.SceneManager?.tweenGroup)
        .to({x: idlePosition + 10},100)
        .easing(Easing.Sinusoidal.InOut)
        .chain( new Tween(this.position, Globals.SceneManager?.tweenGroup)
        .to({x:idlePosition - 10},100)
        .easing(Easing.Sinusoidal.InOut)
        .chain(idleTween))
        .start();


    }
    setActive(active: boolean) {
        this.interactive = active;
        this.cursor = 'pointer';

    }
}