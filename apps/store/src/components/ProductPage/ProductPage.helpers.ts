import { ApolloClient } from '@apollo/client'
import {
  ProductDataDocument,
  ProductDataQuery,
  ProductDataQueryVariables,
} from '@/services/apollo/generated'
import { ProductData } from './ProductPage.types'

type GetProductDataParams = {
  apolloClient: ApolloClient<unknown>
  productName: string
}

export const getProductData = async (params: GetProductDataParams): Promise<ProductData> => {
  const { apolloClient, productName } = params

  const { data } = await apolloClient.query<ProductDataQuery, ProductDataQueryVariables>({
    query: ProductDataDocument,
    variables: { productName },
  })

  if (!data.product) {
    throw new Error(`Unable to fetch product data: ${productName}`)
  }

  return data.product
}
