import styled from '@emotion/styled'
import { Space, Text } from 'ui'
import { Pillow } from '@/components/Pillow/Pillow'
import { SpaceFlex } from '@/components/SpaceFlex/SpaceFlex'

export type ProductItemProps = {
  name: string
  price: string
  pillowSrc: string
  description?: string
}

export const ProductItem = ({ name, price, description, pillowSrc }: ProductItemProps) => {
  return (
    <SpaceFlex space={1} align="start">
      <Pillow size="small" src={pillowSrc} />
      <TextWrapper>
        <Text>{name}</Text>
        <Space y={1}>
          <Text color="textSecondary">{description}</Text>
          <Text>{price}</Text>
        </Space>
      </TextWrapper>
    </SpaceFlex>
  )
}

const TextWrapper = styled.div({
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
})
