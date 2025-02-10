/**
* Parameters required for placing a pixel
* @interface PlacePixelParam
* @property canvasId Identifier for the target canvas (number or string)
* @property xPos X-coordinate position on the canvas
* @property yPos Y-coordinate position on the canvas
* @property color Color value for the pixel
*/
export interface PlacePixelParam {
    canvasId: number | string;
    xPos: number;
    yPos: number;
    color: string;
}