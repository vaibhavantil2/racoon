import { GetServerSidePropsContext } from 'next'
import { FormSection, FormTemplate } from '@/services/formTemplate/FormTemplate.types'
import { FormTemplateService } from '@/services/formTemplate/FormTemplateService'
import { CountryCode } from '@/services/graphql/generated'
import { priceIntentServiceInitServerSide } from '@/services/priceIntent/PriceIntentService'
import { shopSessionServiceInitServerSide } from '@/services/shopSession/ShopSessionService'

type SetupPriceCalculatorParams = {
  countryCode: CountryCode
  productId: string
  request: GetServerSidePropsContext['req']
  response: GetServerSidePropsContext['res']
}

export const setupPriceCalculator = async ({
  countryCode,
  productId,
  request,
  response,
}: SetupPriceCalculatorParams) => {
  const shopSession = await shopSessionServiceInitServerSide({ request, response }).fetch({
    countryCode,
  })
  const priceIntentService = priceIntentServiceInitServerSide({ request, response, shopSession })
  const formTemplateService = new FormTemplateService()

  const [emptyTemplate, priceIntent] = await Promise.all([
    formTemplateService.fetch({ id: productId }),
    priceIntentService.fetch(productId),
  ])

  if (emptyTemplate === null) throw new Error(`No template found for productId: ${productId}`)

  const template = prepopulateFormTemplate(emptyTemplate, priceIntent.data)

  return { template, priceIntent }
}

const prepopulateFormTemplate = (
  template: FormTemplate,
  data: Record<string, unknown>,
): FormTemplate => {
  return {
    sections: template.sections.map((section) => {
      const newSection: FormSection = {
        ...section,
        fields: section.fields.map((field) => ({
          ...field,
          defaultValue: data[field.name] ?? field.defaultValue ?? '',
        })),
        state: 'INITIAL',
      }

      const allRequiredFieldsAreValid = newSection.fields
        .filter((field) => field.required)
        .every((field) => data[field.name])

      if (allRequiredFieldsAreValid) newSection.state = 'VALID'

      return newSection
    }),
  }
}
