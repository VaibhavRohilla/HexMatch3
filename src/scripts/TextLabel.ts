import { Text } from "pixi.js";


export class TextLabel extends Text {


    constructor(x: number, y: number, anchor: number, textToShow: string, size: number, public defaultColor: number = 0xff7f50, font: string = "Montserrat") {
        
        const style = {fontFamily: font,
            fontSize: size,
            fill: defaultColor
        }
        super({text: textToShow, style: style});
        
        this.x = x;
        this.y = y;
        this.anchor.set(anchor);

        this.text = textToShow;
    }

    updateLabelText(text: string) {
        this.text = text;
        // this.style.fill = [color];
    }
}