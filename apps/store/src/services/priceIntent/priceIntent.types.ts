import type {
  PriceIntentCreateMutationVariables,
  PriceIntentDataUpdateMutationVariables,
  PriceIntentQuery,
} from '@/services/apollo/generated'
import { Template } from '@/services/PriceCalculator/PriceCalculator.types'

export type PriceIntentCreateParams = PriceIntentCreateMutationVariables & {
  priceTemplate: Template
}
export type PriceIntentDataUpdateParams = Omit<
  PriceIntentDataUpdateMutationVariables,
  'shopSessionId'
>

export type PriceIntent = Exclude<PriceIntentQuery['priceIntent'], null | undefined>
