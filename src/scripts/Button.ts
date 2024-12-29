import {  Container, GlobalUniformSystem, Graphics, Sprite, Texture } from "pixi.js";
import { TextLabel } from "./TextLabel";
import { GameData, Globals, LevelVar } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";


export class Button extends Container {
    bgGraphic : Graphics
    imageTexture: Sprite;
    price : TextLabel;
    multiplier : number = 1;

    constructor(texture: Texture| undefined,scale : number,currentPrice : number, position: { x: number, y: number },CallBack : ()=> void,public canSetActive : boolean ) {
        super(texture);
        this.bgGraphic = new Graphics();
        this.bgGraphic.roundRect(0,0,150,150,20);
        this.bgGraphic.stroke({color:0x353a50,width:5});
        this.bgGraphic.fill(0x3A3D4A);
        this.bgGraphic.pivot.set(this.bgGraphic.width/2,this.bgGraphic.height/2);
        this.position.set(position.x , position.y );
        this.addChild(this.bgGraphic);

        this.imageTexture  = new Sprite(texture);
        this.imageTexture.anchor.set(0.5);
        this.imageTexture.scale.set(scale);
        this.imageTexture.position.set(0,0);
        this.addChild(this.imageTexture);

        const coin  = new Sprite(Globals.resources.Coin);
        coin.anchor.set(0.5);
        coin.scale.set(0.2);
        coin.position.set(this.width*0.3,this.height*0.4);
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