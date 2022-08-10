import type { ApolloClient } from '@apollo/client'
import type { GetServerSidePropsContext } from 'next'
import type { CountryCode } from '@/services/apollo/generated'
import { CookiePersister } from '@/services/persister/CookiePersister'
import { ServerCookiePersister } from '@/services/persister/ServerCookiePersister'
import { COOKIE_KEY_SHOP_SESSION } from './ShopSession.constants'
import { ShopSessionService } from './ShopSessionService'

type Params = {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
  apolloClient: ApolloClient<unknown>
}

export const getCurrentShopSessionServerSide = async (params: Params) => {
  const { req, res, apolloClient } = params
  const shopSessionService = new ShopSessionService(
    new ServerCookiePersister(COOKIE_KEY_SHOP_SESSION, req, res),
    apolloClient,
  )

  const shopSession = await shopSessionService.fetch()

  if (shopSession === null) throw new Error('Current ShopSession not found')

  return shopSession
}

export const getShopSessionServerSide = async (params: GetShopSessionParams) => {
  const { countryCode, req, res, apolloClient } = params
  const shopSessionService = new ShopSessionService(
    new ServerCookiePersister(COOKIE_KEY_SHOP_SESSION, req, res),
    apolloClient,
  )

  return await shopSessionService.getOrCreate({ countryCode })
}

type GetShopSessionParams = Params & { countryCode: CountryCode }

export const setupShopSessionServiceClientSide = (apolloClient: ApolloClient<unknown>) => {
  return new ShopSessionService(new CookiePersister(COOKIE_KEY_SHOP_SESSION), apolloClient)
}
