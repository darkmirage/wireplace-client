import standardTheme from './standard';
import type { Theme, RawTheme } from './types';

function injectSharedValues(theme: RawTheme): Theme {
  return {
    ...theme,
    zIndices: {
      bottom: 0,
      middle: 1,
      top: 2,
    },
  };
}

const standard = injectSharedValues(standardTheme);

export { standard };
export type { Theme, RawTheme };
