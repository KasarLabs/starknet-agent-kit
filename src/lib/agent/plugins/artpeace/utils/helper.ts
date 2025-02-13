import { PlacePixelParam } from "../types/PlacePixelParam";
import { Checker } from "./checker";

export class ArtpeaceHelper {
    static DEFAULT_WORLD = 0;
    static DEFAULT_COLOR = '0';
  
    static generateRandomPosition(width: number, height: number): { xPos: number, yPos: number } {
      return {
        xPos: Math.floor(Math.random() * width),
        yPos: Math.floor(Math.random() * height)
      };
    }
  
    static async validateAndFillDefaults(param: PlacePixelParam): Promise<{id: number, position: number, color: string}> {
        console.log(param?.canvasId);
        const checker = new Checker(param.canvasId ?? this.DEFAULT_WORLD);
        const id = await checker.checkWorld();
        const { width, height} = checker.getWorldSize();
        const randomPos = this.generateRandomPosition(width, height);
        const position = await checker.checkPosition(param.xPos ?? randomPos.xPos, param.yPos ?? randomPos.yPos);
        const color = await checker.checkColor(param.color ?? this.DEFAULT_COLOR);
        
        return {
            id,
            position,
            color
        };
    }
  }