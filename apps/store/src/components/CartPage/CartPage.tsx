import { datadogLogs } from '@datadog/browser-logs'
import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { FormEventHandler, ReactNode, useEffect, useState } from 'react'
import { Button, Heading, mq, Space, Text, theme } from 'ui'
import { CampaignCodeList } from '@/components/CartInventory/CampaignCodeList'
import { CartEntryItem } from '@/components/CartInventory/CartEntryItem'
import { CartEntryList } from '@/components/CartInventory/CartEntryList'
import { CostSummary } from '@/components/CartInventory/CostSummary'
import {
  ShopSessionAuthenticationStatus,
  useShopSessionAuthenticateMutation,
} from '@/services/apollo/generated'
import { loginMemberSeBankId } from '@/services/authApi/login'
import { exchangeAuthorizationCode } from '@/services/authApi/oauth'
import { saveAccessToken } from '@/services/authApi/persist'
import { ShopSession } from '@/services/shopSession/ShopSession.types'
import { useShopSession } from '@/services/shopSession/ShopSessionContext'
import { useTracking } from '@/services/Tracking/useTracking'
import { useCurrentLocale } from '@/utils/l10n/useCurrentLocale'
import { PageLink } from '@/utils/PageLink'
import { ButtonNextLink } from '../ButtonNextLink'
import { CartPageProps } from './CartPageProps.types'
import { RecommendationList } from './RecommendationList'

export const CartPage = (props: CartPageProps) => {
  const { cartId, entries, campaigns, cost, recommendations } = props
  const { onReady, shopSession } = useShopSession()
  const { t } = useTranslation('cart')

  const tracking = useTracking()
  useEffect(
    () =>
      onReady((shopSession) => {
        const { cart } = shopSession
        if (cart) {
          tracking.reportViewCart(cart)
        } else {
          datadogLogs.logger.error('No cart data on cartPage')
        }
      }),
    [onReady, tracking],
  )

  let body = (
    <EmptyState>
      <Space y={1.5}>
        <HorizontalLine />
        <CampaignCodeList cartId={cartId} campaigns={campaigns} />
        <HorizontalLine />
        <CostSummary {...cost} campaigns={campaigns} />
      </Space>
    </EmptyState>
  )

  if (entries.length > 0) {
    body = (
      <Wrapper>
        <DesktopOnly>
          <Space y={4}>
            <Heading as="h1" variant="standard.32" align="center">
              {t('CART_PAGE_HEADING')}
            </Heading>
            <div />
          </Space>
        </DesktopOnly>
        <Space y={1.5}>
          <CartEntryList>
            {entries.map((item) => (
              <CartEntryItem key={item.offerId} cartId={cartId} {...item} />
            ))}
          </CartEntryList>
          <HorizontalLine />
          <CampaignCodeList cartId={cartId} campaigns={campaigns} />
          <HorizontalLine />
          <CostSummary {...cost} campaigns={campaigns} />
          {shopSession && <CartNextStep shopSession={shopSession} />}
        </Space>
      </Wrapper>
    )
  }

  return (
    <Space y={{ base: 3, sm: 6 }}>
      {body}
      <RecommendationList recommendations={recommendations} />
    </Space>
  )
}

type EmptyStateProps = { children: ReactNode }

const EmptyState = ({ children }: EmptyStateProps) => {
  const { t } = useTranslation('cart')

  return (
    <Wrapper y={4}>
      <div>
        <DesktopOnly>
          <Heading as="h1" variant="standard.32" align="center">
            {t('CART_PAGE_HEADING')}
          </Heading>
        </DesktopOnly>
        <EmptyStateWrapper>
          <Space y={2}>
            <Space y={1}>
              <Text align="center">¯\_(ツ)_/¯</Text>
              <Text align="center" color="textSecondary">
                {t('CART_EMPTY_SUMMARY')}
              </Text>
            </Space>
            <ButtonNextLink href={PageLink.store()}>{t('GO_TO_STORE_BUTTON')}</ButtonNextLink>
          </Space>
        </EmptyStateWrapper>
      </div>
      {children}
    </Wrapper>
  )
}

const CartNextStep = ({ shopSession }: { shopSession: ShopSession }) => {
  if (!shopSession.customer?.ssn) {
    throw new Error('shopSession.customer.ssn must exist at this point')
  }

  const tracking = useTracking()
  const reportCheckout = () => {
    tracking.reportBeginCheckout(shopSession.cart)
  }
  const { t } = useTranslation('cart')
  const router = useRouter()
  const { routingLocale } = useCurrentLocale()
  const handleAuthSuccess = () => {
    reportCheckout()
    router.push(PageLink.checkout({ locale: routingLocale }))
  }

  if (
    shopSession.customer.authenticationStatus ===
    ShopSessionAuthenticationStatus.AuthenticationRequired
  ) {
    return (
      <BankIdLogin
        shopSessionId={shopSession.id}
        ssn={shopSession.customer.ssn}
        onComplete={handleAuthSuccess}
      />
    )
  } else {
    return (
      <ButtonNextLink href={PageLink.checkout()} onClick={reportCheckout}>
        {t('CHECKOUT_BUTTON')}
      </ButtonNextLink>
    )
  }
}

// TODO: Make it reusable between cart and price calculator prompt
// TODO: Localize texts
const BankIdLogin = (props: { shopSessionId: string; ssn: string; onComplete: () => void }) => {
  const [state, setState] = useState<'IDLE' | 'PROGRESS' | 'ERROR'>('IDLE')
  const { shopSessionId } = props
  const [authenticateShopSession] = useShopSessionAuthenticateMutation({
    variables: { shopSessionId },
  })
  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault()
    setState('PROGRESS')
    try {
      const authorizationCode = await loginMemberSeBankId(props.ssn)
      const accessToken = await exchangeAuthorizationCode(authorizationCode)
      saveAccessToken(accessToken)
      await authenticateShopSession()
      props.onComplete()
    } catch (error) {
      datadogLogs.logger.warn('Failed to authenticate', { error })
      setState('ERROR')
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <Text>
        Looks like you&quot;re returning member. You need to login before proceeding to checkout
      </Text>
      <Button type="submit" loading={state !== 'IDLE'}>
        BankID Login
      </Button>
      {state === 'PROGRESS' && <Text>Pleas open BankID app now</Text>}
      {state === 'ERROR' && <Text>Something went wrong</Text>}
    </form>
  )
}

const HorizontalLine = styled.hr({
  backgroundColor: theme.colors.gray300,
  height: 1,
})

const Wrapper = styled(Space)({
  paddingTop: theme.space.md,
  paddingInline: theme.space.md,

  [mq.sm]: {
    paddingTop: theme.space.xxl,
    display: 'grid',
    gridTemplateColumns: 'minmax(28rem, 33%)',
    justifyContent: 'center',
  },
})

const EmptyStateWrapper = styled.div({
  height: '23rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
})

const DesktopOnly = styled.div({
  display: 'none',
  [mq.sm]: { display: 'block' },
})
