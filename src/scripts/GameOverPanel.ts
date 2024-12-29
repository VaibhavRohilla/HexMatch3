import { Tween, Easing } from "@tweenjs/tween.js";
import { Container, Sprite, Graphics, AnimatedSprite, mipmapScaleModeToGlFilter } from "pixi.js";
import { config } from "./appConfig";
import { Globals, LevelVar } from "./Globals";
import { TextLabel } from "./TextLabel";



export class GameRestartPopup extends Container
{


    timer : {timeLeft : number, totalTime : number};
    spinnerUpdate! : (per : number) => void;
    continueTimer: Sprite;
    timerTween: Tween<{ timeLeft: number; totalTime: number; }>;

    constructor(timeLeft : number, onClickCallBack : any = undefined, onCompleteCallBack : any = undefined)
    {
        super();

        Globals.emitter?.Call("ad");
        this.timer = {timeLeft : timeLeft, totalTime : timeLeft};

        this.zIndex = 11;

        const darkBg = new Graphics();
        darkBg.rect(-4000, -500, 7000, 6000);
        darkBg.fill(0x000000);
        darkBg.alpha = 0.5;
        this.addChild(darkBg);


        const bgPanel  = new Sprite(Globals.resources.continueBG);
        bgPanel.anchor.set(0.5);
        bgPanel.x = config.logicalWidth/2;
        bgPanel.y = config.logicalHeight/2;
        this.addChild(bgPanel);

        const textures : any = [
            Globals.resources.continueButton,
            Globals.resources.continueButtonActive,
            Globals.resources.continueButtonHover
        ];

        const btnContinue = this.createButton(textures, config.logicalWidth/2, config.logicalHeight/2 + 300, onClickCallBack);

        const btnText = new TextLabel(btnContinue.x, btnContinue.y - 10, 0.5, "Watch AD", 66, 0x4f3438);
        this.addChild(btnText);


        const playTextures : any = [
            Globals.resources.continuePlayButton,
            Globals.resources.continuePlayButtonActive,
            Globals.resources.continuePlayButtonHover
        ];

        this.createButton(playTextures, config.logicalWidth/2 + 20, config.logicalHeight/2, onClickCallBack);


        const continueText = new TextLabel(btnContinue.x, bgPanel.y - 310, 0.5, "Continue?", 70, 0x4f3438);
        this.addChild(continueText);


        this.continueTimer = new Sprite(Globals.resources.continueTimer);
        this.continueTimer.anchor.set(0.5);
        this.continueTimer.x = config.logicalWidth/2;
        this.continueTimer.y = config.logicalHeight/2;
        this.addChild(this.continueTimer);


        this.generateSpinner3();


        this.timerTween = new Tween(this.timer, Globals.SceneManager?.tweenGroup).to({timeLeft : 0}, timeLeft * 1000)
        .onUpdate((valObj : {timeLeft : number, totalTime : number}) => {
            this.spinnerUpdate(valObj.timeLeft / valObj.totalTime);
        }).onComplete(() => {
            this.timerTween.stop();

            if(onCompleteCallBack)
            {
                onCompleteCallBack();
            }

            setTimeout(() => {
                this.destroy();
            }, 250);
        }).start();
    }




    createButton(textures : any[], x : number, y : number, clickOnCallback : any = undefined ) : AnimatedSprite
    {

        const btn = new AnimatedSprite(textures);
        btn.anchor.set(0.5);
        btn.x = x;
        btn.y = y;
        this.addChild(btn);

        btn.interactive = true;

        btn.on("pointerdown", () => {
            btn.gotoAndStop(1);
            this.timerTween.stop();

            if(clickOnCallback)
            {
                clickOnCallback();
            }

            setTimeout(() => {
                this.destroy();
            }, 250);
        });

        btn.on("pointerup", () => {
            btn.gotoAndStop(0);
        });

        btn.on("pointerover", () => {
            btn.gotoAndStop(2);
        });

        btn.on("pointerout", () => {
            btn.gotoAndStop(0);
        });

        return btn;
    }


    generateSpinner3()
    {

        const mask = new Graphics();
        mask.position.set(this.continueTimer.x, this.continueTimer.y);
        this.continueTimer.mask = mask;


        this.addChild(mask);
    
        this.spinnerUpdate =  (percentage : number) => {
            // Update phase
            const phase = percentage * (Math.PI * 2);
    
            const angleStart = 0 - Math.PI / 2;
            const angle = phase + angleStart;
            const radius = this.continueTimer.width/2;
    
            const x1 = Math.cos(angleStart) * radius;
            const y1 = Math.sin(angleStart) * radius;
    
            // Redraw mask
            mask.clear();
            mask.moveTo(0, 0);
            mask.lineTo(x1, y1);
            mask.arc(0, 0, radius, angleStart, angle, false);
            mask.lineTo(0, 0);
            mask.stroke({color:0xff0000,width:2});
            mask.fill(0xff0000);
        };
    };
}
export class OpenPanel extends Container {
    constructor() {
        super();
        LevelVar.isGameOver = true;
        this.position.set(0,0);
        
        this.addChild(this.addOverlay());
        this.popUpInit();

    
    }
    popUpInit()
    {
        const gameoverbg = new Graphics();
        gameoverbg.roundRect(0, 0, 600, 300, 20);
        gameoverbg.fill(0xFFFFFF);
        gameoverbg.pivot.set(gameoverbg.width/2,gameoverbg.height/2);
        gameoverbg.position.set(config.logicalWidth/2, 0);
        this.addChild(gameoverbg);
        
        const gameoverbg1 = new Graphics();
        gameoverbg1.roundRect(0, 0, 600, 120, 20);
        gameoverbg1.fill(0x99ccff);
        gameoverbg1.position.set(0,gameoverbg.height/2 + gameoverbg1.height/2)
        const gameText = new TextLabel(gameoverbg.width/2, gameoverbg1.height/2 + 20, 0.5, "Hex Shooter!", 50, 0x000000);
        gameoverbg.addChild(gameText);
        // gameoverbg1.position.y = gameoverbg1.height;
        gameoverbg.addChild(gameoverbg1);

        const playButton = new Graphics();
        playButton.roundRect(0, 0, 200, 100, 100);
        playButton.fill(0x99ccff);
        playButton.pivot.set(playButton.width/2,playButton.height/2);
        playButton.position.set(gameoverbg1.width/2, gameoverbg1.height/2 + playButton.height*1.5);
        gameoverbg.addChild(playButton);
        playButton.interactive = true;
        playButton.cursor = 'pointer';

        playButton.on("pointerdown", () => {
            new Tween(gameoverbg.position, Globals.SceneManager?.tweenGroup)
            .to({x : config.logicalWidth/2, y:  -50}, 700)
            .easing(Easing.Back.In)
            .onComplete(() => {LevelVar.isGameOver = false;this.parent?.removeChild(this);})
            .start();
        });

        const playText = new TextLabel(playButton.width/2, playButton.height/2, 0.5, "Play", 50, 0xFFFFFF);
        playButton.addChild(playText);

        new Tween(gameoverbg.position, Globals.SceneManager?.tweenGroup)
        .to({x : config.logicalWidth/2, y:  config.logicalHeight/2}, 700)
        .easing(Easing.Back.Out)
        .start();
    }
    addOverlay() {
        const overlay = new Graphics();
        overlay.rect(-config.logicalWidth*1.5, 0, config.logicalWidth*4, config.logicalHeight*2);
        overlay.fill(0x000000);
        overlay.alpha = 0.5;
        overlay.interactive = true;
        return overlay;
    }
}