import { Application, Container } from "pixi.js";
import { CalculateScaleFactor } from "./appConfig";
import { SceneManager } from "./SceneManager";
import { Globals } from "./Globals";
import { MyEmitter } from "./MyEmitter";
import { Loader } from "./Loader";
import { MainScene } from "./MainScene";
import { log } from "console";

export class App{
	app : Application = new Application();
	constructor() {
        (async () => {
            // Create a new application
			await this.app.init({ background: 0x000000,resolution : window.devicePixelRatio || 1,autoDensity : true,antialias : true});

         	
		// document.body.appendChild( Globals.stats.dom );

		CalculateScaleFactor();

		this.app.renderer.canvas.style.width = `${window.innerWidth}px`;
		this.app.renderer.canvas.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);

		this.app.canvas.oncontextmenu = (e) => {
			e.preventDefault();
		};

		//Setting Up Window On Resize Callback
		window.onresize = (e) => {
			
			CalculateScaleFactor();
			this.app.renderer.resolution = window.devicePixelRatio || 1;
			this.app.renderer.resize(window.innerWidth, window.innerHeight);
			this.app.renderer.canvas.style.width = `${window.innerWidth}px`;
			this.app.renderer.canvas.style.height = `${window.innerHeight}px`;
			SceneManager.instance!.resize();
		};

		//Created Emitter
		Globals.emitter = new MyEmitter();


		//Create Scene Manager
		new SceneManager();

		this.app.stage.addChild(SceneManager.instance.container);
		this.app.ticker.add((dt) => SceneManager.instance!.update(dt.deltaTime));

		// loader for loading data
		const loaderContainer = new Container();
		this.app.stage.addChild(loaderContainer);

		const loader = new Loader( loaderContainer);
			loader.preload().then(() => {
				
				loader.preloadSounds(() => {
					console.log("Preload Done");
					loaderContainer.destroy();
					SceneManager.instance!.start(new MainScene());
					
				});
			});
		//   });
	   

		this.tabChange();
		document.body.appendChild(this.app.canvas);

        })();
    }
    

	tabChange() {
		document.addEventListener("visibilitychange", (event) => {
		if (document.hidden) {
			Globals.emitter?.Call("pause");

		} else {
			Globals.emitter?.Call("resume");
		}
		});
	}
}
