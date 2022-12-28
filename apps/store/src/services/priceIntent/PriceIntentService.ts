import { ApolloClient } from '@apollo/client'
import {
  PriceIntentCreateDocument,
  PriceIntentCreateMutation,
  PriceIntentCreateMutationVariables,
  PriceIntentDataUpdateDocument,
  PriceIntentDataUpdateMutation,
  PriceIntentDataUpdateMutationVariables,
  PriceIntentDocument,
  PriceIntentQuery,
  PriceIntentQueryVariables,
} from '@/services/apollo/generated'
import { SimplePersister } from '@/services/persister/Persister.types'
import { Template } from '@/services/PriceCalculator/PriceCalculator.types'
import { ShopSession } from '@/services/shopSession/ShopSession.types'
import { PriceIntent, PriceIntentCreateParams } from './priceIntent.types'

let id = 1

export class PriceIntentService {
  constructor(
    private readonly persister: SimplePersister,
    private readonly apolloClient: ApolloClient<unknown>,
    public readonly shopSession: ShopSession,
  ) {}
  id = id++
  private createParams: PriceIntentCreateParams | null = null
  private createPromise: Promise<PriceIntent> | null = null

  public async create({ productName, priceTemplate }: PriceIntentCreateParams) {
    const result = await this.apolloClient.mutate<
      PriceIntentCreateMutation,
      PriceIntentCreateMutationVariables
    >({
      mutation: PriceIntentCreateDocument,
      variables: { productName, shopSessionId: this.shopSession.id },
      update: (cache, result) => {
        const priceIntent = result.data?.priceIntentCreate
        if (priceIntent) {
          cache.writeQuery({
            query: PriceIntentDocument,
            variables: { priceIntentId: priceIntent.id },
            data: { priceIntent },
          })
        }
      },
    })
    if (!result.data?.priceIntentCreate) throw new Error('Could not create price intent')

    let priceIntent: PriceIntent = result.data.priceIntentCreate

    if (priceTemplate.initialData) {
      priceIntent = await this.update({
        priceIntentId: priceIntent.id,
        data: priceTemplate.initialData,
      })
    }

    this.persister.save(priceIntent.id, this.getPriceIntentKey(priceTemplate.name))

    return priceIntent
  }

  private async get(priceIntentId: string) {
    try {
      const result = await this.apolloClient.query<PriceIntentQuery, PriceIntentQueryVariables>({
        query: PriceIntentDocument,
        variables: { priceIntentId },
      })
      return result.data?.priceIntent ?? null
    } catch (error) {
      // TODO: should probably be logged by DD-logger, but we don't want to include it in
      // the client bundle. This function is only called from the server but the class is
      // included also in client code. Something to investigate. // siau 2022-09-27
      console.warn(`Unable to get price intent: ${priceIntentId}`)
      console.warn(error)
    }

    return null
  }

  public async getOrCreate(params: FetchParams) {
    const priceIntentId = this.getStoredId(params.priceTemplate.name)

    if (priceIntentId) {
      const priceIntent = await this.get(priceIntentId)
      // @TODO: check if price intent is linked to the product
      if (priceIntent) return priceIntent
    }

    // Deduplicate mutation, Apollo won't do this for us
    const paramsEquals = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
    if (!this.createPromise || !paramsEquals(this.createParams, params)) {
      this.createParams = params
      this.createPromise = this.create(params)
    }
    return await this.createPromise
  }

  private async update(variables: PriceIntentDataUpdateMutationVariables) {
    const updatedResult = await this.apolloClient.mutate<
      PriceIntentDataUpdateMutation,
      PriceIntentDataUpdateMutationVariables
    >({
      mutation: PriceIntentDataUpdateDocument,
      variables,
    })
    const { priceIntent } = updatedResult.data?.priceIntentDataUpdate ?? {}
    if (!priceIntent) {
      throw new Error('Could not update price intent with initial data')
    }
    return priceIntent
  }

  private getPriceIntentKey(templateName: string) {
    return `HEDVIG_${this.shopSession.id}_${templateName}`
  }

  public getStoredId(templateName: string) {
    return this.persister.fetch(this.getPriceIntentKey(templateName))
  }

  public save(templateName: string, priceIntentId: string) {
    this.persister.save(priceIntentId, this.getPriceIntentKey(templateName))
  }

  public clear(templateName: string) {
    this.persister.reset(this.getPriceIntentKey(templateName))
  }
}

type FetchParams = {
  productName: string
  priceTemplate: Template
}
