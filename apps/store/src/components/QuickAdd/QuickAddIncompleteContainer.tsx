import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Button, Space } from 'ui'
import { ButtonNextLink } from '@/components/ButtonNextLink'
import { InputStartDate } from '@/components/InputDate/InputStartDate'
import { OPEN_PRICE_CALCULATOR_QUERY_PARAM } from '@/components/ProductPage/PurchaseForm/useOpenPriceCalculatorQueryParam'
import { PRELOADED_PRICE_INTENT_QUERY_PARAM } from '@/components/ProductPage/PurchaseForm/usePreloadedPriceIntentId'
import { StepperInput } from '@/components/StepperInput/StepperInput'
import {
  usePriceIntentConfirmMutation,
  usePriceIntentDataUpdateMutation,
  useStartDateUpdateMutation,
} from '@/services/apollo/generated'
import { PriceIntent } from '@/services/priceIntent/priceIntent.types'
import { convertToDate, formatAPIDate } from '@/utils/date'
import { getOfferPrice } from '@/utils/getOfferPrice'
import { Language } from '@/utils/l10n/types'
import { useCurrentLocale } from '@/utils/l10n/useCurrentLocale'
import { ORIGIN_URL } from '@/utils/PageLink'
import { useAddToCart } from '@/utils/useAddToCart'
import { ProductDetail, QuickAdd } from './QuickAdd'
import { useShowQuickAdd } from './useShowQuickAdd'

const NUMBER_OF_CO_INSURED_DATA_KEY = 'numberCoInsured'

const PILLOW_PLACEHOLDER =
  'https://a.storyblok.com/f/165473/832x832/fa27811442/hedvig-pillow-home.png'

type Props = {
  shopSessionId: string
  priceIntent: PriceIntent
}

export const QuickAddIncompleteContainer = (props: Props) => {
  const { t } = useTranslation(['cart', 'common', 'purchase-form'])
  const [show] = useShowQuickAdd()

  const tagline = useProductTagline()
  const displayItems = useDisplayItems(props.priceIntent.data)

  const editLink = new URL(props.priceIntent.product.pageLink, ORIGIN_URL)
  editLink.searchParams.set(OPEN_PRICE_CALCULATOR_QUERY_PARAM, '1')
  editLink.searchParams.set(PRELOADED_PRICE_INTENT_QUERY_PARAM, props.priceIntent.id)

  type Offer = (typeof props.priceIntent.offers)[number]
  const offer = props.priceIntent.offers[0] as Offer | undefined

  const offerPrice = offer ? getOfferPrice(offer.cost) : undefined

  const trackingContext = { type: 'incomplete', productName: props.priceIntent.product.name }

  const [updateStartDate, startDateResult] = useStartDateUpdateMutation()
  const [changedStartDate, setChangedStartDate] = useState<Date | undefined>(undefined)
  const handleChangeStartDate = (newDate: Date) => {
    datadogRum.addAction('Quick Add Update Start Date', trackingContext)

    const productOfferIds = props.priceIntent.offers.map((offer) => offer.id)

    if (productOfferIds.length === 0) {
      setChangedStartDate(newDate)
      return
    } else {
      setChangedStartDate(undefined)
    }

    const startDate = formatAPIDate(newDate)
    updateStartDate({ variables: { productOfferIds, startDate } })
  }

  const [addToCart, loadingAddToCart] = useAddToCart({
    shopSessionId: props.shopSessionId,
    onSuccess() {
      datadogLogs.logger.info('Quick Add | Added offer to cart', trackingContext)
    },
  })
  const handleClickAdd = async () => {
    datadogRum.addAction('Quick Add To Cart', trackingContext)

    const productOfferId = offer?.id
    if (!productOfferId) return

    if (changedStartDate) {
      datadogLogs.logger.info('Quick Add | Auto-update start date', trackingContext)
      const startDate = formatAPIDate(changedStartDate)
      await updateStartDate({ variables: { productOfferIds: [productOfferId], startDate } })
    }

    await addToCart(productOfferId)
  }

  const [confirm, confirmResult] = usePriceIntentConfirmMutation({
    variables: { priceIntentId: props.priceIntent.id },
  })
  const [updateData, updateDateResult] = usePriceIntentDataUpdateMutation({
    onCompleted() {
      datadogLogs.logger.info('Quick Add | Confirm after updating value', trackingContext)
      confirm()
    },
  })
  const handleChangeValue = (value: number) => {
    datadogRum.addAction('Quick Add Update Value', trackingContext)
    updateData({
      variables: {
        priceIntentId: props.priceIntent.id,
        data: { [NUMBER_OF_CO_INSURED_DATA_KEY]: value },
        customer: { shopSessionId: props.shopSessionId },
      },
    })
  }

  if (!show) return null

  const startDate = convertToDate(offer?.startDate) ?? changedStartDate

  const Body = (
    <Space y={1}>
      <ul>
        {displayItems.map((item) => (
          <ProductDetail key={item.key} value={item.displayValue}>
            {item.displayTitle}
          </ProductDetail>
        ))}
      </ul>

      <Space y={0.25}>
        <StepperInput
          label={t('purchase-form:FIELD_HOUSEHOLD_SIZE_LABEL')}
          max={5}
          min={0}
          required={true}
          defaultValue={offer?.priceIntentData[NUMBER_OF_CO_INSURED_DATA_KEY]}
          optionLabel={(count) => t('purchase-form:HOUSEHOLD_SIZE_VALUE', { count })}
          onChange={handleChangeValue}
        />
        <InputStartDate date={startDate} onChange={handleChangeStartDate} />
      </Space>
    </Space>
  )

  const loading =
    startDateResult.loading || loadingAddToCart || updateDateResult.loading || confirmResult.loading

  return (
    <QuickAdd
      // TODO: use "props.priceIntent.product.displayNameFull"
      title={props.priceIntent.product.displayNameShort}
      // TODO: use "props.priceIntent.product.tagline"
      subtitle={tagline}
      // TODO: use "props.priceIntent.product.pillowImage"
      pillow={{ src: PILLOW_PLACEHOLDER }}
      href={props.priceIntent.product.pageLink}
      price={offerPrice}
      Body={Body}
    >
      <Button size="medium" onClick={handleClickAdd} loading={loading}>
        {t('QUICK_ADD_BUTTON')}
      </Button>
      <ButtonNextLink size="medium" variant="ghost" href={editLink}>
        {t('common:READ_MORE')}
      </ButtonNextLink>
    </QuickAdd>
  )
}

const useProductTagline = () => {
  const { language } = useCurrentLocale()
  // Assume home insurance
  // TODO: Get from API since it's product specific
  return language === Language.En
    ? 'Incl. condominium coverage and all-risk'
    : 'Inkl. bostadsrättstillägg och drulle'
}

const STREET_ADDRESS_DATA_KEY = 'street'
const ZIP_CODE_DATA_KEY = 'zipCode'
const LIVING_SPACE_DATA_KEY = 'livingSpace'

type DisplayItem = { key: string; displayValue: string; displayTitle: string }

// TODO: Get from API since it's product specific
// Example: "props.priceIntent.displayItems"
const useDisplayItems = (data: Record<string, unknown>): Array<DisplayItem> => {
  const { t } = useTranslation('cart')

  const streetAddress = data[STREET_ADDRESS_DATA_KEY] as string | undefined
  const zipCode = data[ZIP_CODE_DATA_KEY] as string | undefined
  const livingSpace = data[LIVING_SPACE_DATA_KEY] as number | undefined

  return [
    ...(streetAddress
      ? [{ key: 'street', displayValue: streetAddress, displayTitle: t('DATA_TABLE_STREET_LABEL') }]
      : []),

    ...(zipCode
      ? [{ key: 'zipCode', displayValue: zipCode, displayTitle: t('DATA_TABLE_ZIP_CODE_LABEL') }]
      : []),

    ...(livingSpace
      ? [
          {
            key: 'livingSpace',
            displayValue: t('DATA_TABLE_LIVING_SPACE_VALUE', { area: livingSpace }),
            displayTitle: t('DATA_TABLE_LIVING_SPACE_LABEL'),
          },
        ]
      : []),
  ]
}
