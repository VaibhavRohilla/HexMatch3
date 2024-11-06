
import { Howl } from 'howler';
import * as PIXI from 'pixi.js';
import { Assets} from 'pixi.js';
import { App } from './App';
import { MyEmitter } from './MyEmitter';
import { isMobile } from 'pixi.js';
type globalDataType = {
  resources: { [key: string]: PIXI.Texture }; 
  emitter: MyEmitter | undefined;
  isMobile: boolean;
  // fpsStats : Stats | undefined,
  soundResources: { [key: string]: Howl };

  App: App | undefined,
};

export const Globals: globalDataType = {
  resources: {},
  emitter: undefined,
  get isMobile() {
    //  return true;
    return isMobile.any;
  },
  // fpsStats: undefined,
  App: undefined,
  soundResources: {},
};