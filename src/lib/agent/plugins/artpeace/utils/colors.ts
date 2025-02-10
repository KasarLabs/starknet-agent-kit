import { HSV, RGB } from "../types/ColorType";

export class ColorAnalyzer {
    // Seuils pour déterminer la luminosité
    private static LIGHT_THRESHOLD = 0.7;
    private static DARK_THRESHOLD = 0.3;
    private static WHITE_THRESHOLD = 245;
    private static BLACK_THRESHOLD = 10;
    private static GRAY_DIFFERENCE_THRESHOLD = 15; // Différence maximale entre les composantes pour le gris
    private static SATURATION_THRESHOLD = 0.15;
  
    static analyzeColor(hex: string): string {
      const rgb = this.hexToRgb(hex);
      const hsv = this.rgbToHsv(rgb);
      
      if (this.isWhite(rgb)) {
        return "white";
      }
  
      // Vérifier noir
      if (this.isBlack(rgb)) {
        return "black";
      }
  
      if (this.isGray(rgb, hsv)) {
        const brightness = this.calculateBrightness(rgb);
        if (brightness > this.LIGHT_THRESHOLD) {
          return "light gray";
        } else if (brightness < this.DARK_THRESHOLD) {
          return "dark gray";
        }
        return "gray";
      }

      // Déterminer la couleur de base
      const baseColor = this.getBaseColor(hsv);
      
      // Analyser la luminosité
      const brightness = this.calculateBrightness(rgb);
      let description = '';
  
      if (brightness > this.LIGHT_THRESHOLD) {
        description = `${baseColor} light`;
      } else if (brightness < this.DARK_THRESHOLD) {
        description = `${baseColor} dark`;
      } else {
        description = baseColor;
      }
  
      // Analyser la saturation
      if (hsv.s < 0.2) {
        description = `${description} gray`;
      } else if (hsv.s > 0.8) {
        description = `${description} bright`;
      }
  
      return description;
    }

    private static isGray(rgb: RGB, hsv: HSV): boolean {
      // Vérifier si les composantes RGB sont proches les unes des autres
      const maxDiff = Math.max(
        Math.abs(rgb.r - rgb.g),
        Math.abs(rgb.g - rgb.b),
        Math.abs(rgb.b - rgb.r)
      );
  
      // Vérifier la faible saturation
      return maxDiff <= this.GRAY_DIFFERENCE_THRESHOLD && hsv.s <= this.SATURATION_THRESHOLD;
    }
  
    private static isWhite(rgb: RGB): boolean {
      return rgb.r > this.WHITE_THRESHOLD && 
             rgb.g > this.WHITE_THRESHOLD && 
             rgb.b > this.WHITE_THRESHOLD;
    }
  
    private static isBlack(rgb: RGB): boolean {
      return rgb.r < this.BLACK_THRESHOLD && 
             rgb.g < this.BLACK_THRESHOLD && 
             rgb.b < this.BLACK_THRESHOLD;
    }

    private static hexToRgb(hex: string): RGB {
        // Enlever le # si présent
        const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;
      
        // Convertir en RGB
        return {
          r: parseInt(cleanHex.substring(0, 2), 16),
          g: parseInt(cleanHex.substring(2, 4), 16),
          b: parseInt(cleanHex.substring(4, 6), 16)
        };
    }

    private static rgbToHsv(rgb: RGB): HSV {
        // Normalisation des valeurs RGB entre 0 et 1
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
      
        // Calcul des valeurs min et max pour déterminer la valeur (v)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
      
        // Initialisation des valeurs HSV
        let h = 0;        // Teinte
        let s = 0;        // Saturation
        const v = max;    // Valeur = maximum des composantes RGB
      
        // Calcul de la saturation
        // Si max est 0, la couleur est noire et la saturation est 0
        // Sinon, on calcule la saturation comme (max-min)/max
        s = max === 0 ? 0 : diff / max;
      
        // Calcul de la teinte
        if (diff === 0) {
          // Si diff est 0, c'est un gris (pas de teinte)
          h = 0;
        } else {
          // Calcul de la teinte selon la composante dominante
          switch (max) {
            case r:
              // Rouge dominant : on calcule entre jaune et magenta
              h = ((g - b) / diff) + (g < b ? 6 : 0);
              break;
            case g:
              // Vert dominant : on calcule entre cyan et jaune
              h = ((b - r) / diff) + 2;
              break;
            case b:
              // Bleu dominant : on calcule entre magenta et cyan
              h = ((r - g) / diff) + 4;
              break;
          }
          // Conversion en degrés (multiplication par 60)
          h *= 60;
        }
      
        // Normalisation de la teinte pour s'assurer qu'elle est entre 0 et 360
        if (h < 0) h += 360;
      
        return { h, s, v };
      }
  
    private static calculateBrightness(rgb: RGB): number {
      // Formule de luminosité perçue
      return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    }
  
    private static getBaseColor(hsv: HSV): string {
      // Conversion de la teinte (h) en nom de couleur
      const hue = hsv.h;
      
      if (hue >= 350 || hue < 10) return 'red';
      if (hue >= 10 && hue < 45) return 'orange';
      if (hue >= 45 && hue < 70) return 'yellow';
      if (hue >= 70 && hue < 150) return 'green';
      if (hue >= 150 && hue < 200) return 'cyan';
      if (hue >= 200 && hue < 260) return 'blue';
      if (hue >= 260 && hue < 310) return 'purple';
      return 'magenta';
    }
  }