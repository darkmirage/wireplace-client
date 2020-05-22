export type RawTheme = {
  color: {
    background: string;
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
