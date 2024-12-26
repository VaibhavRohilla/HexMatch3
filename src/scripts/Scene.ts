import { Container, Graphics, Sprite } from "pixi.js";
import { config } from "./appConfig";
import { AnimatedBackgroundSprite, BackgroundGraphic, BackgroundSprite } from "./Background";
import { TextLabel } from "./TextLabel";
import { log } from "node:console";

export abstract class Scene {


    private sceneContainer: Container;


    mainContainer: Container;
    private mainBackground: BackgroundGraphic | BackgroundSprite;


    constructor(fullBackgroundColor: any) {
        this.sceneContainer = new Container();

        this.mainBackground = new BackgroundGraphic(window.innerWidth, window.innerHeight, fullBackgroundColor);

        this.sceneContainer.addChild(this.mainBackground);

        this.mainContainer = new Container();

        this.resetMainContainer();

        this.sceneContainer.addChild(this.mainContainer);



        // if (typeof mainBackgroundColor === "number") {
        //     this.mainBackground = new BackgroundGraphic(config.logicalWidth, config.logicalHeight, mainBackgroundColor);
        // } else {
        //     this.mainBackground = new BackgroundSprite(mainBackgroundColor, config.logicalWidth, config.logicalHeight);
        // }

        // this.mainContainer.addChild(this.mainBackground);


        // const mask = new Graphics();
        // mask.fill(0xffffff);
        // mask.rect(0, 0, config.logicalWidth, config.logicalHeight);
        // this.mainContainer.addChild(mask);
        // this.mainContainer.mask = mask;

    }
  
   

    resetMainContainer() {
        this.mainContainer.x = config.minLeftX;
        this.mainContainer.y = config.minTopY;
        this.mainContainer.scale.set(config.minScaleFactor);
    }

    resize(): void {
        this.resetMainContainer();
        this.mainBackground.resetBg(window.innerWidth, window.innerHeight);
    }

    initScene(container: Container) {
        container.addChild(this.sceneContainer);
    }
    destroyScene() {
        this.sceneContainer.destroy();
    }

    addChildToFullScene(component: any) {
        
        this.sceneContainer.addChild(component);
    }
    removeChildToFullScene(component:any) {
        this.sceneContainer.removeChild(component);
    }
    addChildToIndexFullScene(component: any, index: number) {
        this.sceneContainer.addChildAt(component, index);
    }

    abstract update(dt: number): void;

    abstract recievedMessage(msgType: string, msgParams: any): void;
}