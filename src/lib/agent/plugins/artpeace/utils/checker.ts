import { WorldType } from "../types/WorldType";
import { ColorAnalyzer } from "./colors";

export class Checker {
    private world: WorldType;

    constructor(private param: string | number) {};

    async checkWorld() : Promise<number> {
        try{
            let id: number;
            if (typeof this.param === "string") {
                const response = await fetch(`https://api.art-peace.net/get-world-id?worldName=${this.param}`);

                if (!response.ok){
                    throw new Error(`HTTP Error status: ${response.status}`);
                }
                const data: number = await response.json();
                id = data;
                console.log("id: ", id);
            } else {
                id = this.param;
            }
            const response = await fetch(`https://api.art-peace.net/get-world?worldId=${id}`)

            if (!response.ok) {
                throw new Error(`HTTP Error status: ${response.status}`);
            }
            const data = await response.json();
            this.world = data.data;
            console.log(this.world);
            return (this.world.worldId);
        } catch(error) {
            throw new Error(error.message ? error.message : "Error when check the world ID for artpeace")
        }
    }

    async checkPosition(x: number, y: number) : Promise<number> {
        try {
            if (x > this.world.width) {
                throw new Error("Bad Position");
            } else if (y > this.world.height) {
                throw new Error("Bad Position.");
            }
            return x + y * this.world.width;
        } catch(error) {
            throw new Error(error.message ? error.message : "Error when check the position for artpeace")
        }
    }

    async checkColor(color: string) : Promise<string> {
        try {
            const response = await fetch(`https://api.art-peace.net/get-worlds-colors?worldId=${this.world.worldId}`)
            if (!response.ok) {
                throw new Error(`HTTP Error status: ${response.status}`);
            }
            const data = await response.json();
            const allHexColor: string[] = data.data;

            const cleanColor = color.charAt(0) === '#' ? color.substring(1) : color;
            const isHex = allHexColor.indexOf(cleanColor);
            if (isHex != -1 )
                return `${isHex}`;

            const allColor: string[] = allHexColor.map((cleanColor)=> ColorAnalyzer.analyzeColor(cleanColor))

            const index: number = allColor.indexOf(cleanColor);
            if (index === -1 ) 
                throw new Error(`the color ${cleanColor} is not available in this world `);

            console.log(allColor);
            return `${index}`;
        } catch(error) {
            throw new Error(error.message ? error.message : "Error when check the colors for artpeace")
        }
    }
}