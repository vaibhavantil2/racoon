import styled from '@emotion/styled'
import { storyblokEditable } from '@storyblok/react'
import { HeadingLabelProps } from 'ui/src/components/HeadingLabel/HeadingLabel'
import { ConditionalWrapper, HeadingLabel, theme } from 'ui'
import { SbBaseBlockProps } from '@/services/storyblok/storyblok'

export const Wrapper = styled.div({
  paddingLeft: theme.space.md,
  paddingRight: theme.space.md,
})

export type HeadingLabelBlockProps = SbBaseBlockProps<{
  text: string
  as: HeadingLabelProps['as']
}>

export const HeadingLabelBlock = ({ blok, nested }: HeadingLabelBlockProps) => {
  return (
    <ConditionalWrapper condition={!nested} wrapWith={(children) => <Wrapper>{children}</Wrapper>}>
      <HeadingLabel as={blok.as} {...storyblokEditable(blok)}>
        {blok.text}
      </HeadingLabel>
    </ConditionalWrapper>
  )
}
HeadingLabelBlock.blockName = 'headingLabel'
