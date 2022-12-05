import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { FormEvent, FormEventHandler } from 'react'
import { Button, Heading, InputField, LinkButton, Space } from 'ui'
import { CartCard } from '@/components/CartCard/CartCard'
import { PriceBreakdown } from '@/components/PriceBreakdown/PriceBreakdown'
import { useCartEntryRemoveMutation } from '@/services/apollo/generated'
import { I18nNamespace } from '@/utils/l10n/types'
import { useCurrentLocale } from '@/utils/l10n/useCurrentLocale'
import { PageLink } from '@/utils/PageLink'
import { CartPageProps } from './CartPageProps.types'
import { useRedeemCampaign, useUnredeemCampaign } from './useCampaign'
import { useStartCheckout } from './useStartCheckout'

export const CartPage = (props: CartPageProps) => {
  const { shopSessionId, cartId, products, campaigns, cost } = props
  const { t } = useTranslation(I18nNamespace.Cart)
  const { locale } = useCurrentLocale()
  const [removeCartEntry, { loading }] = useCartEntryRemoveMutation({
    refetchQueries: 'active',
    awaitRefetchQueries: true,
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>, offerId: string) => {
    event.preventDefault()
    await removeCartEntry({ variables: { cartId, offerId, locale } })
  }

  const [redeemCampaign, { loading: loadingRedeemCampaign, userError }] = useRedeemCampaign({
    cartId,
  })
  const handleSubmitCampaign: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const code = formData.get('campaignCode')
    if (typeof code === 'string') {
      redeemCampaign(code)
    }
  }

  const [unredeemCampaign, { loading: loadingUnredeenCampaign }] = useUnredeemCampaign({ cartId })
  const handleSubmitUnredeemCampaign = (campaignId: string): FormEventHandler => {
    return (event) => {
      event.preventDefault()
      unredeemCampaign(campaignId)
    }
  }

  const router = useRouter()
  const [startCheckout, { loading: loadingStartCheckout }] = useStartCheckout({
    shopSessionId,
    onCompleted() {
      router.push(PageLink.checkout())
    },
  })

  if (products.length === 0) {
    return <EmptyState />
  }

  return (
    <Wrapper>
      <Space y={3}>
        <StyledHeading as="h1" variant="standard.24">
          Cart ({products.length})
        </StyledHeading>
        <ProductList as="ul" y={1.5}>
          {products.map((item) => (
            <li key={item.id}>
              <CartCard
                title={item.name}
                price={item.cost}
                currency={item.currency}
                onSubmit={(event) => handleSubmit(event, item.id)}
                loading={loading}
              />
            </li>
          ))}
        </ProductList>

        <Space y={2}>
          <form onSubmit={handleSubmitCampaign}>
            <Space y={0.5}>
              <InputField
                name="campaignCode"
                label="Campaign code"
                errorMessage={userError?.message}
              />
              <Button disabled={loadingRedeemCampaign}>Add code</Button>
            </Space>
          </form>

          <ul>
            {campaigns.map((item) => (
              <li key={item.id}>
                <Space y={0.5}>
                  <p>{item.displayName}</p>
                  <form onSubmit={handleSubmitUnredeemCampaign(item.id)}>
                    <Button disabled={loadingUnredeenCampaign}>Remove</Button>
                  </form>
                </Space>
              </li>
            ))}
          </ul>
        </Space>

        <Footer>
          <Space y={1.5}>
            <PriceBreakdown currency="SEK" products={products} cost={cost} />

            <Button onClick={startCheckout} fullWidth disabled={loadingStartCheckout}>
              {t('CHECKOUT_BUTTON')}
            </Button>
          </Space>
        </Footer>
      </Space>
    </Wrapper>
  )
}

const EmptyState = () => {
  const { t } = useTranslation(I18nNamespace.Cart)
  const { routingLocale } = useCurrentLocale()

  return (
    <Wrapper>
      <Space y={3}>
        <StyledHeading as="h1" variant="standard.24">
          Cart (0)
        </StyledHeading>
        <CenteredParagraph>{t('CART_EMPTY_SUMMARY')}</CenteredParagraph>
        <Footer>
          <LinkButton fullWidth href={PageLink.store({ locale: routingLocale })}>
            {t('GO_TO_STORE_BUTTON')}
          </LinkButton>
        </Footer>
      </Space>
    </Wrapper>
  )
}

const Wrapper = styled.div(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  paddingLeft: theme.space[4],
  paddingRight: theme.space[4],
  paddingTop: '3.5rem',
}))

const StyledHeading = styled(Heading)({ textAlign: 'center' })
const CenteredParagraph = styled.p({ textAlign: 'center' })

const ProductList = styled(Space)({
  padding: 0,
  listStyleType: 'none',
  width: '100%',
})

const Footer = styled.footer(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  padding: `0 ${theme.space[3]} ${theme.space[6]} ${theme.space[3]}`,
  a: {
    textDecoration: 'none',
  },
}))
