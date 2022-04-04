import { colorsV3, fonts } from '@hedviginsurance/brand'

export const theme = {
  fonts: {
    body: `'${fonts.FAVORIT}', sans-serif`,
    heading: `'${fonts.FAVORIT}', sans-serif`,
  },
  colors: {
    ...colorsV3,
    dark: `${colorsV3.gray900}`,
    light: `${colorsV3.gray100}`,
    lavender: `${colorsV3.purple500}`,
  },
}

const simplifiedColorNames: Record<string, string> = {
  lavender: theme.colors.purple500,
  dark: theme.colors.gray900,
}

export const getColor = (color?: string) => {
  return theme.colors[color as keyof typeof theme.colors] || 'currentColor'
}
