import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CartFragmentFragment, CurrencyCode } from '@/services/apollo/generated'
import { CartInventory } from './CartInventory'

export default {
  title: 'Cart Inventory',
  component: CartInventory,
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphonese2',
    },
  },
} as ComponentMeta<typeof CartInventory>

const Template: ComponentStory<typeof CartInventory> = () => {
  return <CartInventory cart={MOCK_CART} />
}

export const Default = Template.bind({})
Default.args = {}

const MOCK_CART: CartFragmentFragment = {
  id: 'fd2fe15b-7e05-4b1d-8f3d-72300077ad20',
  cost: {
    subtotal: { amount: 178, currencyCode: CurrencyCode.Sek },
    total: { amount: 178, currencyCode: CurrencyCode.Sek },
  },
  entries: [
    {
      id: 'a98c1fe0-a216-412d-8664-fe130daec0f8',
      variant: { typeOfContract: 'SE_APARTMENT_RENT', displayName: '◰ Hem' },
      price: { amount: 109, currencyCode: CurrencyCode.Sek },
      startDate: '2022-10-26',
    },
    {
      id: 'c89d2bcf-c7de-408e-95b0-570b75294795',
      variant: { typeOfContract: 'SE_ACCIDENT', displayName: '◰ Olycksfall' },
      price: { amount: 69, currencyCode: CurrencyCode.Sek },
      startDate: null,
    },
  ],
}
