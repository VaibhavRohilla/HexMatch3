
import { Howl } from 'howler';
import * as PIXI from 'pixi.js';
import { Assets} from 'pixi.js';
import { App } from './App';
import { MyEmitter } from './MyEmitter';
import { isMobile } from 'pixi.js';
import { Scene } from './Scene';
import { SceneManager } from './SceneManager';
type globalDataType = {
  resources: { [key: string]: PIXI.Texture }; 
  emitter: MyEmitter | undefined;
  isMobile: boolean;
  SceneManager : SceneManager | undefined,
  // fpsStats : Stats | undefined,
  soundResources: { [key: string]: Howl };

  App: App | undefined,
  isVisible: boolean;
};

export const Globals: globalDataType = {
  resources: {},
  emitter: undefined,
  SceneManager : undefined,
  get isMobile() {
    //  return true;
    return isMobile.any;
  },
  // fpsStats: undefined,
  App: undefined,
  soundResources: {},
  isVisible: true,
};

export const GameData = {
  	CurrentScore : 0,
  	HighScore : 0,
  	CurrentSpeed : 4,
  	CurrentColorLevel : 3,
	Money : 0,
	canChangeLevel : true,
	isMusicOn : true,
}

export const LevelVar = {
	HEX_RADIUS : 45,
 	HEX_ROWS : 2,
 	FILL_COLOR : 0x353a50,
 	HEX_SPACING : 40,
	hexGap : 10,
	hexSpawnTime : 1700,
	isGameOver : true
}


export const powerUps = {
	canHammer : false,
	canMoveHand : false
}

function saveInCookies(name: string, value: number | string) {
	const expiryDate = new Date();
	expiryDate.setTime(expiryDate.getTime() + 30 * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + value + "; expires=" + expiryDate.toUTCString();
}
function getFromCookies(name: string) {
	const nameEQ = name + "=";
	const ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}
export const ScoreFunctions = {
	setHighScore(score: number) {
		if (score > GameData.HighScore) {
			GameData.HighScore = score;
			saveInCookies("highScore", GameData.HighScore);
      return true;
			//save in cookies
		}
    return false;
	},

	getHighscore() {
		const highscore = getFromCookies("highScore");
		if (highscore) {
			return parseInt(highscore);
		} else {
			return 0;
		}
	},
	getCurrentMoney() {
		const Money = getFromCookies("Money");
		if (Money) {
			return parseInt(Money);
		} else {
			return 0;
		}
	},
	setCurrentMoney(Money: number) {
			GameData.Money += Money;
			saveInCookies("Money", GameData.Money);
			//save in cookies
		}
	}

