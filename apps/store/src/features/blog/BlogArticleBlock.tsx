import styled from '@emotion/styled'
import { StoryblokComponent, renderRichText, storyblokEditable } from '@storyblok/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Heading, Space, Text } from 'ui'
import { richTextStyles } from '@/blocks/RichTextBlock/RichTextBlock.styles'
import { ArticleTeaser } from '@/components/ArticleTeaser/ArticleTeaser'
import { GridLayout } from '@/components/GridLayout/GridLayout'
import { SpaceFlex } from '@/components/SpaceFlex/SpaceFlex'
import { type SbBaseBlockProps } from '@/services/storyblok/storyblok'
import { useFormatter } from '@/utils/useFormatter'
import { BLOG_ARTICLE_CONTENT_TYPE } from './blog.constants'
import { convertToBlogArticleCategory } from './blog.helpers'
import { type BlogArticleContentType } from './blog.types'

type Props = SbBaseBlockProps<BlogArticleContentType['content']>

export const BlogArticleBlock = (props: Props) => {
  const formatter = useFormatter()
  const contentHtml = useMemo(() => renderRichText(props.blok.content), [props.blok.content])
  const categories = props.blok.categories.map(convertToBlogArticleCategory)

  return (
    <>
      <GridLayout.Root {...storyblokEditable(props.blok)}>
        <GridLayout.Content width={{ lg: '2/3', xl: '1/2', xxl: '1/3' }} align="center">
          <Space y={1}>
            <SpaceFlex space={0.25}>
              {categories.map((item) => (
                <Link key={item.id} href={item.href}>
                  <ArticleTeaser.Badge>{item.name}</ArticleTeaser.Badge>
                </Link>
              ))}
            </SpaceFlex>
            <Heading as="h1" variant={{ _: 'serif.32', lg: 'serif.48' }}>
              {props.blok.page_heading}
            </Heading>
            <Text size="sm" color="textSecondary">
              {formatter.fromNow(new Date(props.blok.date))}
            </Text>
          </Space>
          <RichTextContent dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </GridLayout.Content>
      </GridLayout.Root>
      {props.blok.body.map((item) => (
        <StoryblokComponent blok={item} key={item._uid} />
      ))}
    </>
  )
}
BlogArticleBlock.blockName = BLOG_ARTICLE_CONTENT_TYPE

const RichTextContent = styled.div(richTextStyles)