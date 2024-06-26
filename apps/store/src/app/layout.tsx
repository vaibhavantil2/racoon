// Workaround to make app dir works with emotion compiler enabled
// next.config.js - { compiler: { emotion: true } }
/** @jsxImportSource react */

import { type PropsWithChildren } from 'react'
import { NextAppDirEmotionCacheProvider } from 'tss-react/next/appDir'
import { ApolloWrapper } from '@/services/apollo/app-router/ApolloWrapper'
import { contentFontClassName } from '@/utils/fonts'
import { GlobalStyles } from './GlobalStyles'

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en">
      {/* head-tag needed, even if empty: https://docs.tss-react.dev/ssr/next.js */}
      <head></head>
      <body className={contentFontClassName}>
        <ApolloWrapper>
          <NextAppDirEmotionCacheProvider options={{ key: 'css' }}>
            <GlobalStyles />
            {children}
          </NextAppDirEmotionCacheProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}

export default Layout

export const metadata = {
  twitter: { site: '@hedvigapp', card: 'summary_large_image' },
  themeColor: 'hsl(0, 0%, 98%)', // theme.colors.light
  icons: [
    { rel: 'apple-touch-icon', sizes: '76x76', url: '/apple-touch-icon.png' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: 'hsl(0, 0%, 7%)', // theme.colors.gray1000
    },
  ],
  manifest: '/site.webmanifest',
}
