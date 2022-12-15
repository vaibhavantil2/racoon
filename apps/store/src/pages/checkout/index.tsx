import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useGetDiscountExplaination } from '@/components/CartInventory/CartInventory.helpers'
import CheckoutPage from '@/components/CheckoutPage/CheckoutPage'
import { FormElement } from '@/components/CheckoutPage/CheckoutPage.constants'
import type { CheckoutPageProps } from '@/components/CheckoutPage/CheckoutPage.types'
import { addApolloState, initializeApollo } from '@/services/apollo/client'
import { fetchCurrentCheckoutSigning } from '@/services/Checkout/Checkout.helpers'
import logger from '@/services/logger/server'
import { SHOP_SESSION_PROP_NAME } from '@/services/shopSession/ShopSession.constants'
import { getCurrentShopSessionServerSide } from '@/services/shopSession/ShopSession.helpers'
import { useShopSession } from '@/services/shopSession/ShopSessionContext'
import { convertToDate } from '@/utils/date'
import { isRoutingLocale } from '@/utils/l10n/localeUtils'

type NextPageProps = Pick<CheckoutPageProps, 'checkoutSigningId'> & {
  [SHOP_SESSION_PROP_NAME]: string
}

const NextCheckoutPage: NextPage<NextPageProps> = (props) => {
  const { shopSession } = useShopSession()
  const getDiscountExplanation = useGetDiscountExplaination()

  if (!shopSession || !shopSession.checkout) return null

  const cartCost = shopSession.cart.cost
  const cart = {
    id: shopSession.cart.id,
    cost: {
      total: cartCost.net,
      crossOut: cartCost.net.amount !== cartCost.gross.amount ? cartCost.gross : undefined,
    },
    entries: shopSession.cart.entries.map((item) => ({
      offerId: item.id,
      title: item.variant.displayName,
      cost: item.price,
      startDate: convertToDate(item.startDate) ?? undefined,
    })),
    campaigns: shopSession.cart.redeemedCampaigns.map((item) => ({
      id: item.id,
      code: item.code,
      explanation: getDiscountExplanation(item.discount),
    })),
  }

  const contactDetails = shopSession.checkout.contactDetails
  const prefilledData = {
    [FormElement.FirstName]: contactDetails.firstName ?? '',
    [FormElement.LastName]: contactDetails.lastName ?? '',
    [FormElement.PersonalNumber]: contactDetails.personalNumber ?? '',
    [FormElement.PhoneNumber]: contactDetails.phoneNumber ?? '',
    [FormElement.Email]: contactDetails.email ?? '',
  }

  return (
    <CheckoutPage
      {...props}
      checkoutId={shopSession.checkout.id}
      cart={cart}
      prefilledData={prefilledData}
    />
  )
}

export const getServerSideProps: GetServerSideProps<NextPageProps> = async (context) => {
  const { req, res, locale } = context
  if (!isRoutingLocale(locale)) return { notFound: true }

  try {
    const apolloClient = initializeApollo({ req, res })
    const [shopSession, translations] = await Promise.all([
      getCurrentShopSessionServerSide({ apolloClient, req, res }),
      serverSideTranslations(locale),
    ])

    const { checkout } = shopSession
    if (!checkout) {
      logger.warn('No checkout info in shopSession')
      return { notFound: true }
    }

    const checkoutSigning = await fetchCurrentCheckoutSigning({
      req,
      apolloClient,
      checkoutId: checkout.id,
    })

    const pageProps: NextPageProps = {
      ...translations,
      [SHOP_SESSION_PROP_NAME]: shopSession.id,
      checkoutSigningId: checkoutSigning?.id ?? null,
    }

    return addApolloState(apolloClient, { props: pageProps })
  } catch (error) {
    logger.error(error, 'Failed to get server side props for checkout page')
    return { notFound: true }
  }
}

export default NextCheckoutPage
