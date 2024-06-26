const gray = {
  100: '#fafafa',
  200: '#f2f2f2',
  300: '#eaeaea',
  500: '#aaaaaa',
  600: '#777777',
  700: '#505050',
  800: '#272727',
  900: '#121212',
}

const purple = {
  100: '#f5ebf5',
  300: '#e3d7ee',
  500: '#d7c6e6',
  700: '#ccb9df',
  800: '#bea4d5',
  900: '#8c67ad',
}

const red = {
  500: '#e24646',
  600: '#dd2727',
}

export const legacyColors = {
  gray100: gray[100],
  gray200: gray[200],
  gray300: gray[300],
  gray500: gray[500],
  gray600: gray[600],
  gray700: gray[700],
  gray800: gray[800],
  gray900: gray[900],
  purple100: purple[100],
  purple300: purple[300],
  purple500: purple[500],
  purple700: purple[700],
  purple800: purple[800],
  purple900: purple[900],
  red500: red[500],
  red600: red[600],
  black: '#000000',
  white: '#ffffff',
  // Alias colors
  dark: gray[900],
  light: gray[100],
  lavender: purple[500],
  textPrimary: gray[900],
  textSecondary: gray[700],
  textTertiary: gray[500],
  textDisabled: gray[500],
  textNegative: gray[100],

  // Compatability with new theme
  gray1000: gray[900],
  gray50: gray[100],
  green50: '#e6f4e6',
  green100: '#e6f4e6',
}

export type LegacyUIColor = keyof typeof legacyColors
