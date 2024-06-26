import { ISbAlternateObject, ISbStoryData } from '@storyblok/react'
import Head from 'next/head'
import { SEOData } from '@/services/storyblok/storyblok'
import { getImgSrc } from '@/services/storyblok/Storyblok.helpers'
import { Features } from '@/utils/Features'
import { organization } from '@/utils/jsonSchema'
import { isRoutingLocale, toIsoLocale } from '@/utils/l10n/localeUtils'
import { ORIGIN_URL } from '@/utils/PageLink'

type Props = {
  story: ISbStoryData<SEOData>
  robots?: 'index' | 'noindex'
}

export const HeadSeoInfo = ({ story, robots }: Props) => {
  const { canonicalUrl, seoTitle, seoMetaDescription, seoMetaOgImage } = story.content
  // Make it possible to override robots value for A/B test cases
  const robotsContent = robots ?? story.content.robots

  return (
    <>
      <Head>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="robots" content={robotsContent} />
        {seoMetaDescription && (
          <>
            <meta name="description" content={seoMetaDescription} />
            <meta property="og:description" content={seoMetaDescription} />
          </>
        )}
        {seoMetaOgImage?.filename && (
          <meta property="og:image" content={getImgSrc(seoMetaOgImage.filename)} />
        )}
        {seoTitle && (
          <>
            <meta property="og:title" content={seoTitle} />
            <title>{seoTitle}</title>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      </Head>
      {/* Must include link to self along with other variants */}

      <AlternateLinks story={story} />
    </>
  )
}

const AlternateLinks = ({ story }: { story: ISbStoryData<SEOData> }) => {
  const alternates = story.alternates.filter(isVisibleAlternate)

  return (
    <>
      <AlternateLink fullSlug={story.full_slug} />
      {alternates.map((alternate) => (
        <AlternateLink key={alternate.id} fullSlug={alternate.full_slug} />
      ))}
    </>
  )
}

const isVisibleAlternate = (alternate: ISbAlternateObject) =>
  Features.enabled('ENGLISH_LANGUAGE') || !getHrefLang(alternate.full_slug).startsWith('en-')

const AlternateLink = ({ fullSlug }: { fullSlug: string }) => {
  return (
    <Head>
      <link
        rel="alternate"
        href={`${ORIGIN_URL}/${removeTrailingSlash(fullSlug)}`}
        hrefLang={getHrefLang(fullSlug)}
      />
    </Head>
  )
}

const getHrefLang = (fullSlug: string) => {
  const slugLocale = fullSlug.split('/')[0]
  return isRoutingLocale(slugLocale) ? toIsoLocale(slugLocale) : 'x-default'
}

const removeTrailingSlash = (url: string) => {
  return url.endsWith('/') ? url.slice(0, -1) : url
}
