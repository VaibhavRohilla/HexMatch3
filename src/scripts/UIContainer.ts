import { Container, Graphics, Sprite } from "pixi.js";
import { TextLabel } from "./TextLabel";
import { config } from "./appConfig";
import { GameData, Globals, LevelVar, ScoreFunctions } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";
import { Button } from "./Button";

export class UiContainer extends Container
{
    currentScoreText !: TextLabel;
    BestScoreText !: TextLabel;
    currentMoneyText !: TextLabel;
    hammerBtn !: Button;
    reverseBtn !: Button;
    handBtn !: Button;


    constructor()
    {
        super();
        this.TopUI();
        this.currentScoreUiInit();
        this.BottomUI();
    }
    BottomUI() {

        this.hammerBtn = new Button(Globals.resources.Hammer,0.05,50,{ x: 205 , y : 1795},()=>{Globals.emitter?.Call("canHammer")},false);
        this.hammerBtn.imageTexture.rotation = 0.5;
        this.addChild( this.hammerBtn);

        this.reverseBtn = new Button(Globals.resources.Reverse,0.05,40,{ x: 515 , y : 1795},()=>{Globals.emitter?.Call("ActivateReverse")},true);
        this.addChild(this.reverseBtn);

        this.handBtn = new Button(Globals.resources.Hand,0.05,10,{ x: 815 , y : 1795},()=>{Globals.emitter?.Call("canUseHand")},false);
        this.addChild(this.handBtn);
    }
    TopUI() {
        GameData.HighScore = ScoreFunctions.getHighscore();
        this.bestScoreUiInit();
        this.MoneyUiInit();
    }
    currentScoreUiInit()
    {
        const currentScoreContainer = new Graphics();
        currentScoreContainer.roundRect(0, 0, 300, 150, 10);
        currentScoreContainer.position.set(config.logicalWidth/2 - 150, 125);
        currentScoreContainer.fill(0x3A3D4A);
        currentScoreContainer.stroke({color:LevelVar.FILL_COLOR,width:5});
        currentScoreContainer.allowChildren = true;
        this.addChild(currentScoreContainer);
        this.currentScoreText  = new TextLabel(currentScoreContainer.width/2,currentScoreContainer.height/2,0.5,GameData.CurrentScore.toString(),80,0xFFFFFF);
        currentScoreContainer.addChild(this.currentScoreText);
    }

    bestScoreUiInit()
    {
      
        const bestScoreContainer = new Graphics();
        bestScoreContainer.roundRect(0, 0, 250, 100, 10);
        bestScoreContainer.position.set(40, 100);
        bestScoreContainer.fill(0x3A3D4A);
        bestScoreContainer.stroke({color:LevelVar.FILL_COLOR,width:5});
        bestScoreContainer.allowChildren = true;

        this.addChild(bestScoreContainer);
        this.BestScoreText  = new TextLabel(bestScoreContainer.width*0.5,bestScoreContainer.height/2,0,GameData.HighScore.toString(),50,0xFFFFFF);
        this.BestScoreText.anchor.set(0,0.5);
        const highscoreCrown = new Sprite(Globals.resources.Crown);
        highscoreCrown.anchor.set(0.5);
        highscoreCrown.position.set(bestScoreContainer.width*0.18,bestScoreContainer.height/2);
        highscoreCrown.scale.set(0.05)
        bestScoreContainer.addChild(highscoreCrown);
        bestScoreContainer.addChild(this.BestScoreText);
    }
    MoneyUiInit()
    {
        GameData.Money = ScoreFunctions.getCurrentMoney();
        const MoneyContainer = new Graphics();
        MoneyContainer.roundRect(0, 0, 250, 100, 10);
        MoneyContainer.position.set(config.logicalWidth - 295, 100);
        MoneyContainer.fill(0x3A3D4A);
        MoneyContainer.stroke({color:LevelVar.FILL_COLOR,width:5});
        MoneyContainer.allowChildren = true;
        this.addChild(MoneyContainer);
   
       
        this.currentMoneyText = new TextLabel(MoneyContainer.width*0.5,MoneyContainer.height/2,0,GameData.Money.toString(),50,0xFFFFFF);
        this.currentMoneyText.anchor.set(0,0.5);
        MoneyContainer.addChild(this.currentMoneyText);
        const moneyIcon = new Sprite(Globals.resources.Coin);
        moneyIcon.anchor.set(0.5);
        moneyIcon.position.set(MoneyContainer.width*0.2,MoneyContainer.height/2);
        moneyIcon.scale.set(0.3)
        MoneyContainer.addChild(moneyIcon);
    }

    updateCurrentMoney(money: number) {
        ScoreFunctions.setCurrentMoney(money);
        this.currentMoneyText.updateLabelText(GameData.Money.toString());
    }

    updateScore(score: number) {
        ScoreFunctions.setCurrentMoney(score);
        this.currentMoneyText.updateLabelText(GameData.Money.toString());

        const startScore = GameData.CurrentScore;
        GameData.CurrentScore += score*3;

        const endScore = GameData.CurrentScore; 
        const scoreProgress = { value: startScore };
        new Tween(scoreProgress, Globals.SceneManager?.tweenGroup)
            .to({ value: endScore }, 500) 
            .easing(Easing.Quadratic.Out)
            .onUpdate(() => {
               
                this.currentScoreText.updateLabelText(Math.round(scoreProgress.value).toString());
            })
            .onComplete(() => {
             
                this.currentScoreText.updateLabelText(GameData.CurrentScore.toString());
                if(ScoreFunctions.setHighScore(GameData.CurrentScore)){
                    this.BestScoreText.updateLabelText(GameData.HighScore.toString());
                };
            })
            .start();

            
        if(GameData.CurrentScore > 90 && GameData.CurrentScore < 200 && GameData.canChangeLevel){
            GameData.CurrentSpeed = 4.5;
            GameData.CurrentColorLevel = 4;
            LevelVar.hexGap -= 1.2;
            LevelVar.hexSpawnTime -= 200;
            GameData.canChangeLevel = false;
            console.log("____________________________LEVEL 2____________________________");
            

        }
        
        if(GameData.CurrentScore >= 200 && GameData.CurrentScore < 300 && !GameData.canChangeLevel){
            GameData.CurrentSpeed = 5;
            LevelVar.hexGap -= 1.2;
            LevelVar.HEX_ROWS = 3;
            GameData.canChangeLevel = true;
            LevelVar.hexSpawnTime -= 300;
            console.log("____________________________LEVEL 3____________________________");
         
            Globals.emitter?.Call("changeLevel");

        }
        
        if(GameData.CurrentScore >= 300 && GameData.CurrentScore < 400 && GameData.canChangeLevel){
            GameData.CurrentSpeed = 5.5;
            LevelVar.hexGap -= 1.2;
            LevelVar.HEX_ROWS = 4;
            GameData.CurrentColorLevel = 5;
            GameData.canChangeLevel = false;
            LevelVar.hexSpawnTime -= 300;
            console.log("____________________________LEVEL 4____________________________");
           
            Globals.emitter?.Call("changeLevel");
        }
        if(GameData.CurrentScore >= 400 && GameData.CurrentScore < 500 && GameData.canChangeLevel){
            LevelVar.hexGap -= 1.2;
            LevelVar.HEX_ROWS = 5;
            GameData.CurrentColorLevel = 6;
            LevelVar.hexSpawnTime -= 500;
            GameData.canChangeLevel = false;
            console.log("____________________________LEVEL 5____________________________");

            Globals.emitter?.Call("changeLevel");
        }
        if(GameData.CurrentScore >= 500 && !GameData.canChangeLevel){
            LevelVar.hexGap -= 1.2;
            GameData.CurrentSpeed = 6;
            LevelVar.hexSpawnTime -= 300;
            console.log("____________________________LEVEL 6____________________________");
            GameData.canChangeLevel = true;
        }

 
    }
}
