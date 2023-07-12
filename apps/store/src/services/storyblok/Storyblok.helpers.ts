import { StoryblokClient } from '@storyblok/js'
import { type SbBlokData, type ISbStoryData } from '@storyblok/react'
import { type Language } from '@/utils/l10n/types'
import { LinkField, ProductStory, StoryblokVersion } from './storyblok'

export const filterByBlockType = <BlockData extends SbBlokData>(
  blocks: BlockData[] = [],
  targetType: string,
): BlockData[] => {
  const result: BlockData[] = []
  for (const block of blocks) {
    const blockOfType = checkBlockType(block, targetType)
    if (blockOfType === null) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(`Found blok of type ${block.component}. Only ${targetType} expected`)
      }
    } else {
      result.push(block)
    }
  }
  return result
}

export const checkBlockType = <BlockData extends SbBlokData>(
  block: SbBlokData,
  targetType: string,
): BlockData | null => {
  if (block.component === targetType) return block as BlockData
  else return null
}

export type StoryblokFetchParams = {
  version: StoryblokVersion
  language?: Language
  resolve_relations?: string
}

const STORYBLOK_CACHE_VERSION = process.env.STORYBLOK_CACHE_VERSION
export const fetchStory = async <StoryData extends ISbStoryData>(
  storyblokClient: StoryblokClient,
  slug: string,
  params: StoryblokFetchParams,
): Promise<StoryData> => {
  let cv: number | undefined
  if (params.version === 'published') {
    cv = (STORYBLOK_CACHE_VERSION && parseInt(STORYBLOK_CACHE_VERSION)) || undefined
  }
  const response = await storyblokClient.getStory(slug, {
    ...params,
    cv,
    resolve_links: 'url',
  })

  return response.data.story as StoryData
}

const MISSING_LINKS = new Set()
export const getLinkFieldURL = (link: LinkField, linkText?: string) => {
  if (link.story) return makeAbsolute(link.story.url)

  if (link.linktype === 'url') return makeAbsolute(link.url)

  // Warn about CMS links without target. This could be either reference to something not yet created or misconfiguration
  if (!MISSING_LINKS.has(link.id)) {
    MISSING_LINKS.add(link.id)
    console.log('Did not see story field in link, returning empty URL.', linkText, link)
  }

  return makeAbsolute(link.cached_url)
}

const makeAbsolute = (url: string) => {
  if (/^(\/|https?:\/\/|\/\/)/.test(url)) {
    return url
  }
  return '/' + url
}

export const isProductStory = (story: ISbStoryData): story is ProductStory => {
  return story.content.component === 'product'
}

export const getStoryblokImageSize = (filename: string) => {
  const [, width, height] = filename.match(/\/(\d+)x(\d+)\//) ?? []

  if (!width || !height) return null

  return { width: Number(width), height: Number(height) }
}

type ImageOptimizationOptions = {
  maxHeight?: number
  maxWidth?: number
}
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {},
) => {
  let optimizationRules = ''
  if (options.maxHeight || options.maxWidth) {
    optimizationRules = `fit-in/${options.maxWidth ?? 0}x${options.maxHeight ?? 0}`
  }
  return `${originalUrl}/m/${optimizationRules}`
}
