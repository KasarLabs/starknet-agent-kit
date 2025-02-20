import { NotFoundException } from "@nestjs/common";
import { getColorsParam } from "../schema";
import { Checker } from "../utils/checker";

/**
 * Fetch all available colors in world to facilate the agent to choose the right color
 * @param canvasId The canvas Id or unique name to retrieve the color of this world 
 * @returns JSON with the status of the the result and a array of colors or error message
 */
export const getColors = async (param: getColorsParam) => {
    try { 
        if (typeof param.canvasId === 'undefined') throw new NotFoundException('CanvasId not found');

        console.log(param.canvasId);
        const checker = new Checker(param.canvasId);
        await checker.checkWorld();
        const {ascii, hex} = await checker.getColors();

        const colors = hex.map((color, index) => {
            return {hex: color, name: ascii[index]}
        })
        return JSON.stringify({
            colors
        })
    }
    catch (error) {
        return JSON.stringify({
            status: 'error',
            error: {
                code: 'GET_COLORS_ERROR',
                message: error.message || 'Failed to generate place_pixel call data',
            },
        })
    }
}