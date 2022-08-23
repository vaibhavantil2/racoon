import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { ChevronIcon, Space } from 'ui'
import { Text } from '@/components/Text/Text'
import { useCurrencyFormatter } from '@/utils/useCurrencyFormatter'
import { CheckoutPaymentPageProps } from '../CheckoutPaymentPage/CheckoutPaymentPage.types'

type Props = CheckoutPaymentPageProps

export const PriceBreakdown = ({ currency, cost, products, campaigns }: Props) => {
  const currencyFormatter = useCurrencyFormatter(currency)

  return (
    <Collapsible>
      <CollapsibleContent>
        <Space y={0.5}>
          <DataRow>
            <Text size="m">Subtotal</Text>
            <Text size="m">{currencyFormatter.format(cost.subTotal)}</Text>
          </DataRow>
          {products.map((product) => (
            <DataRow key={product.name}>
              <Text size="m">{product.name}</Text>
              <Price>{currencyFormatter.format(product.cost)}</Price>
            </DataRow>
          ))}
        </Space>
        {campaigns ? (
          <Space y={0.5}>
            <Text size="m">Discount</Text>
            {campaigns.map((campaign) => (
              <DataRow key={campaign.name}>
                <Text size="m">{campaign.name}</Text>
                <Text size="m">{currencyFormatter.format(campaign.discount)}</Text>
              </DataRow>
            ))}
          </Space>
        ) : null}
        <CollapsibleDivider />
      </CollapsibleContent>
      <CollapsibleHeader>
        <Text size="l">Total</Text>
        <SpaceFlex x={0.25}>
          {cost.crossOut ? (
            <CrossOutText>
              <Text size="l">{currencyFormatter.format(cost.crossOut)}</Text>
            </CrossOutText>
          ) : null}

          <SpaceFlex x={0.5}>
            <Text size="l">{currencyFormatter.format(cost.total)}/mo.</Text>
            <TriggerIcon size="1rem" />
          </SpaceFlex>
        </SpaceFlex>
      </CollapsibleHeader>
    </Collapsible>
  )
}

const Collapsible = styled(RadixCollapsible.Root)({})

const DataRowStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: '0.5rem',
  '&:first-child': {
    marginLeft: 0,
  },
})

const DataRow = styled.div(() => ({}), DataRowStyles)

const CollapsibleHeader = styled(RadixCollapsible.Trigger)(DataRowStyles, ({ theme }) => ({
  paddingRight: theme.space[1],
  width: '100%',
  marginLeft: 0,
}))

const CrossOutText = styled.p(({ theme }) => ({
  color: theme.colors.gray500,
  textDecoration: 'line-through',
}))

const SpaceFlex = styled(Space)(() => ({
  display: 'flex',
  alignItems: 'center',
}))

const TriggerIcon = styled(ChevronIcon)({
  transition: 'transform 300ms',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
})

const CollapsibleContent = styled(RadixCollapsible.Content)(() => ({}))

const CollapsibleDivider = styled.div(({ theme }) => ({
  borderTop: `1px solid ${theme.colors.gray300}`,
  height: theme.space[2],
  marginTop: '0.75rem',
  marginBottom: theme.space[3],
}))

const Price = styled.p(({ theme }) => ({
  fontSize: theme.fontSizes[1],
  color: theme.colors.gray600,
}))
