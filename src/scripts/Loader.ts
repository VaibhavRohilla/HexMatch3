import * as PIXI from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { config } from './appConfig';
import { BackgroundGraphic } from './Background';
import { Globals } from './Globals';
import { LoaderConfig, fontData, LoaderSoundConfig, staticData } from './LoaderConfig';
import FontFaceObserver from 'fontfaceobserver';
import { Howl } from 'howler';
import { log } from 'node:console';
import { SpineSprite } from 'pixi-spine';

export class Loader extends PIXI.Container {

    resources: any;
    loaderBarContainer: PIXI.Container | undefined;
    apiDataLoaded : boolean = false;
    progressBox!: PIXI.Graphics;
    progressBar!: PIXI.Graphics;


    constructor() {
        super();
        this.resources = LoaderConfig;
        Assets.init();
        this.createLoadingPage();
       
    }

    async createLoadingPage() {
        //background



        const background = new BackgroundGraphic(window.innerWidth, window.innerHeight,0x191c28);
        background.width = window.innerWidth;
        background.height = window.innerHeight;
        this.addChild(background);

        //loaderbar
        this.loaderBarContainer = new PIXI.Container();
        this.progressBox = new PIXI.Graphics();
        this.progressBar = new PIXI.Graphics();
        Assets.add({alias : "logo", src :  staticData.logoURL});
        PIXI.Assets.load(staticData.logoURL).then((texture) => {
        
            const logo = new Sprite(texture);
            logo.anchor.set(0.5,1);
            logo.scale.set(0.2)
            logo.position.set(boxData.x,boxData.y - boxData.height*3);
            if(this.loaderBarContainer)
            this.loaderBarContainer.addChild(logo);
        });

 

        this.progressBox.roundRect(boxData.x - boxData.width / 2, boxData.y, boxData.width, boxData.height,20);
        this.progressBox.fill(0x3c3c3c);
        this.progressBox.alpha = 0.8;


        

        // const progressText = new TextLabel("0%", 0, 0, '#FFF');
        // progressText.anchor.set(1, 0);
        // progressText.position = new PIXI.Point(boxData.x + boxData.width/2, boxData.y + boxData.height);

        this.loaderBarContainer.addChild( this.progressBox);
        this.loaderBarContainer.addChild( this.progressBar);
        // this.loaderBarContainer.addChild(progressText);

        this.loaderBarContainer.scale.set(config.minScaleFactor);

        this.loaderBarContainer.x = config.minLeftX;
        this.loaderBarContainer.y = config.minTopY;

        this.addChild(this.loaderBarContainer);
     
    }


 
 onProgress = (progress: number) => {
    // console.log(`Loading progress: ${progress}%`);
    let value = progress / 1;
            this.progressBar
            .fill(0xFFFFFF)
            .rect(boxData.x - (boxData.width * 0.49), boxData.y + boxData.height / 4, boxData.width * 0.98 * value, boxData.height / 2);
            
            
            // progressText.text = `${Math.ceil(e.progress)}%`;
        
};

    preload() {

        return new Promise( resolve => {

            const keys : string[] = [];
             for (let key in this.resources) {
                 Assets.add({alias : key, src :  this.resources[key].default});
                 keys.push(key);
                 

             }
             Assets.load(keys,this.onProgress).then((textures)=>{
                // console.log(textures);
                Globals.resources = textures;
                const fontArray: any = [];
                    fontData.forEach((fontName: any) => {
                        fontArray.push(new FontFaceObserver(fontName).load());
                    });
                    if (fontArray.length == 0)
                        resolve(0);
                    else {
                        Promise.all(fontArray).then(() => {
                            resolve(0);
                        }); 
                    }
             });
            });
        };

    preloadSounds(onCompleteCallback: () => void) {
        const totalCount = Object.keys(LoaderSoundConfig).length;
        let currentCount = 0;
        console.log("Preloading Sounds");
        
        if (totalCount == 0)
        {
            this.progressBar.destroy();
            this.progressBox.destroy();

            onCompleteCallback();
        }
        for (let key in LoaderSoundConfig) {
      
            
            const sound = new Howl({
                src: [LoaderSoundConfig[key].default],
            });
            sound.load();

            Globals.soundResources[key] = sound;
            
                currentCount++;
                if (currentCount >= totalCount) {
                    this.progressBar.destroy();
                    this.progressBox.destroy();
                    onCompleteCallback();
                }
          


        }
    }
    
    


}

const boxData = {
    width: (config.logicalWidth * 0.4),
    height: 20,
    x: config.logicalWidth / 2,
    y: config.logicalHeight / 2 + 20
};