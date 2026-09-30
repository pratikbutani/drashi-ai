export type Language = 'en' | 'hi' | 'gu';

export type AssistiveMode = 'general' | 'text_ocr' | 'currency' | 'objects_colors' | 'question';

export type HighContrastTheme = 'yellow-black' | 'white-black' | 'cyan-black' | 'black-white';

export type TextSize = 'normal' | 'large' | 'giant';

export interface SpatialItem {
  position: string; // e.g. "12 o'clock", "2 o'clock", "floor"
  item: string;
  distance?: string;
}

export interface VisionAnalysis {
  headline: string;
  speechScript: string;
  safetyLevel: 'safe' | 'caution' | 'danger';
  hazardsAndObstacles: string[];
  spatialLayout?: SpatialItem[];
  detectedText?: string;
  detectedCurrency?: string;
  suggestedAction: string;
}

export interface AnalysisResponse {
  success: boolean;
  language: Language;
  mode: AssistiveMode;
  analysis: VisionAnalysis;
  error?: string;
}
