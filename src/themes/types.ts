export type RawTheme = {
  color: {
    backgroundDark: string;
    backgroundLight: string;
    textDark: string;
    textLight: string;
    panel: string;
  };
  spacing: {
    narrow: number;
    normal: number;
    wide: number;
  };
  fontFamily: string;
};

export type Theme = RawTheme & {
  zIndices: {
    bottom: number;
    middle: number;
    top: number;
  };
};
