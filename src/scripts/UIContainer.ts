import { Container, Graphics } from "pixi.js";
import { TextLabel } from "./TextLabel";
import { config } from "./appConfig";
import { GameData, Globals, LevelVar, ScoreFunctions } from "./Globals";
import { Easing, Tween } from "@tweenjs/tween.js";

export class UiContainer extends Container
{
    currentScoreText : TextLabel;
    BestScoreText : TextLabel;

    constructor()
    {
        super();
        this.position.set(config.leftX,0);
        GameData.HighScore = ScoreFunctions.getHighscore();
        const BestScoreText = new TextLabel(200,50,0.5,"BEST",50,0xd64955);
        this.addChild(BestScoreText);
        const scoreText = new TextLabel(BestScoreText.position.x + BestScoreText.width*1.5,50,0.5,"SCORE",50,0xd64955);
        this.addChild(scoreText);
        this.currentScoreText  = new TextLabel(scoreText.position.x,scoreText.height*2,0.5,GameData.CurrentScore.toString(),50,0x5a9bc7);
        this.addChild(this.currentScoreText);

        this.BestScoreText  = new TextLabel(BestScoreText.position.x,BestScoreText.height*2,0.5,GameData.HighScore.toString(),50,0x5a9bc7);
        this.addChild(this.BestScoreText);
    }

    updateScore(score: number) {
        const startScore = GameData.CurrentScore; // Current score
        GameData.CurrentScore += score; // Add the score
        const endScore = GameData.CurrentScore ; // New score after addition
        // Create a progress object to hold the interpolated score value
        const scoreProgress = { value: startScore };
    
        // Tween to interpolate the score value
        new Tween(scoreProgress, Globals.SceneManager?.tweenGroup)
            .to({ value: endScore }, 500) // Duration in milliseconds
            .easing(Easing.Quadratic.Out) // Smooth easing
            .onUpdate(() => {
                // Update the label text with the rounded interpolated value
                this.currentScoreText.updateLabelText(Math.round(scoreProgress.value).toString());
            })
            .onComplete(() => {
                // Ensure the final value is set exactly to the end score
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
