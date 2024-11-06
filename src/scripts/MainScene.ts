import { GlobalUniformSystem, Sprite } from "pixi.js";
import { Scene } from "./Scene";
import { Globals } from "./Globals";
import { config } from "./appConfig";

import { Container } from "pixi.js";


export class MainScene extends Scene {
	constructor() {
		super(0x000000);
		
	

	}


	resize(): void {
		super.resize();
	}


	update(dt: number): void {

		
	}




	recievedMessage(msgType: string, msgParams: any): void {
	
	}

}
