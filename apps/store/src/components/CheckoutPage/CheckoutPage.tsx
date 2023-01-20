import { useApolloClient } from '@apollo/client'
import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useState } from 'react'
import { Button, Heading, mq, Space, Text, theme } from 'ui'
import { CampaignCodeList } from '@/components/CartInventory/CampaignCodeList'
import { CartEntryItem } from '@/components/CartInventory/CartEntryItem'
import { CartEntryList } from '@/components/CartInventory/CartEntryList'
import { CostSummary } from '@/components/CartInventory/CostSummary'
import * as FullscreenDialog from '@/components/FullscreenDialog/FullscreenDialog'
import { PersonalNumberField } from '@/components/PersonalNumberField/PersonalNumberField'
import { SpaceFlex } from '@/components/SpaceFlex/SpaceFlex'
import { TextField } from '@/components/TextField/TextField'
import { saveAccessToken } from '@/services/authApi/persist'
import { setupShopSessionServiceClientSide } from '@/services/shopSession/ShopSession.helpers'
import { useShopSession } from '@/services/shopSession/ShopSessionContext'
import { useTracking } from '@/services/Tracking/useTracking'
import { PageLink } from '@/utils/PageLink'
import { BankIdIcon } from './BankIdIcon'
import { CartCollapsible } from './CartCollapsible/CartCollapsible'
import { FormElement } from './CheckoutPage.constants'
import { CheckoutPageProps } from './CheckoutPage.types'
import { useHandleSubmitCheckout } from './useHandleSubmitCheckout'

const CheckoutPage = (props: CheckoutPageProps) => {
  const { cart, ssn, prefilledData, collectName, shopSessionId, shopSessionSigningId } = props
  const { t } = useTranslation('checkout')

  const [showSignError, setShowSignError] = useState(false)
  const { shopSession } = useShopSession()
  const router = useRouter()
  const apolloClient = useApolloClient()
  const tracking = useTracking()
  const [handleSubmitSign, { loading, userError }] = useHandleSubmitCheckout({
    shopSessionId,
    shopSessionSigningId,
    onSuccess(accessToken) {
      saveAccessToken(accessToken)
      const shopSessionId = shopSession?.id
      if (!shopSessionId) {
        throw new Error('shopSessionId must exists at this point')
      }
      tracking.reportPurchase(shopSession.cart)
      setupShopSessionServiceClientSide(apolloClient).reset()
      router.push(PageLink.checkoutPayment({ shopSessionId }))
    },
    onError() {
      setShowSignError(true)
    },
  })

  const submitButtonMessage = loading ? t('OPEN_BANKID_DESCRIPTION') : t('SIGN_DISCLAIMER')

  return (
    <FullscreenDialog.Root open={showSignError} onOpenChange={setShowSignError}>
      <Wrapper y={{ base: 1, lg: 4 }}>
        <Header as="header">
          <HeaderHeading as="h1" variant="standard.24">
            {t('CHECKOUT_PAGE_HEADING')}
          </HeaderHeading>
          <HeaderLink href={PageLink.cart()}>{t('BACK_BUTTON')}</HeaderLink>
        </Header>

        <Space y={0.5}>
          <Section>
            <CartCollapsible
              title={t('CART_INVENTORY_COLLAPSIBLE_TITLE', { count: cart.entries.length })}
              cost={cart.cost}
            >
              <CartCollapsibleInner y={1.5}>
                <CartEntryList>
                  {cart.entries.map((item) => (
                    <CartEntryItem key={item.offerId} cartId={cart.id} {...item} />
                  ))}
                </CartEntryList>
                <HorizontalLine />
                <CampaignCodeList cartId={cart.id} campaigns={cart.campaigns} />
                <HorizontalLine />
                <CostSummary {...cart.cost} campaigns={cart.campaigns} />
              </CartCollapsibleInner>
            </CartCollapsible>
          </Section>

          <HorizontalLineStandalone />
        </Space>

        <Section y={1}>
          <SpaceBetween>
            <SpaceFlex space={0.5} align="center">
              <StepIcon />
              <Text>{t('CONTACT_DETAILS_FORM_TITLE')}</Text>
            </SpaceFlex>
          </SpaceBetween>

          <form onSubmit={handleSubmitSign}>
            <Space y={0.25}>
              <PersonalNumberField
                label={t('FIELD_PERSONAL_NUMBER_SE_LABEL')}
                value={ssn}
                readOnly
                disabled
              />
              {collectName && (
                <SpaceFlex space={0.25}>
                  <TextField
                    type="text"
                    label={t('FORM_FIRST_NAME_LABEL')}
                    name={FormElement.FirstName}
                    defaultValue={prefilledData.firstName}
                    required
                  />
                  <TextField
                    type="text"
                    label={t('FORM_LAST_NAME_LABEL')}
                    name={FormElement.LastName}
                    defaultValue={prefilledData.lastName}
                    required
                  />
                </SpaceFlex>
              )}
              <TextField
                type="email"
                label={t('FORM_EMAIL_LABEL')}
                name={FormElement.Email}
                defaultValue={prefilledData.email}
                required
              />
              <Space y={0.5}>
                <SignButton loading={loading}>
                  {t('SIGN_BUTTON', { count: cart.entries.length })}
                </SignButton>
                <Text size="sm" color="textSecondary" align="center">
                  {userError?.message ?? submitButtonMessage}
                </Text>
              </Space>
            </Space>
          </form>
        </Section>
      </Wrapper>

      <FullscreenDialog.Modal
        center
        Footer={
          <FullscreenDialog.Close asChild>
            <Button type="button" variant="primary">
              {t('ERROR_GENERAL_DIALOG_ACTION_TRY_AGAIN')}
            </Button>
          </FullscreenDialog.Close>
        }
      >
        <ErrorPrompt size={{ _: 'md', lg: 'lg' }} align="center">
          {t('ERROR_GENERAL_DIALOG_PROMPT')}
        </ErrorPrompt>
      </FullscreenDialog.Modal>
    </FullscreenDialog.Root>
  )
}

const Wrapper = styled(Space)({
  paddingBottom: theme.space.xl,
  maxWidth: '40rem',
  marginLeft: 'auto',
  marginRight: 'auto',
})

const Section = styled(Space)({
  paddingInline: theme.space.md,
})

const Header = styled(Section)({
  height: '3.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  [mq.lg]: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '7rem',
  },
})

const HeaderHeading = styled(Heading)({
  [mq.lg]: {
    textAlign: 'center',
    fontSize: theme.fontSizes.xxl,
  },
})

const HeaderLink = styled(Link)({
  backgroundColor: theme.colors.light,
  fontSize: theme.fontSizes.md,

  ':focus-visible': {
    borderRadius: theme.radius.xs,
    boxShadow: `${theme.colors.light} 0 0 0 3px, ${theme.colors.textPrimary} 0 0 0 4px`,
  },

  [mq.lg]: {
    position: 'absolute',
    top: theme.space.md,
    right: theme.space.md,
  },
})

const HorizontalLine = styled.hr({
  backgroundColor: theme.colors.gray300,
  height: 1,
})

const HorizontalLineStandalone = styled(HorizontalLine)({
  marginInline: theme.space.md,
})

const StepIcon = styled.div({
  width: '1rem',
  height: '1rem',
  borderRadius: '50%',
  backgroundColor: theme.colors.gray900,
})

const SpaceBetween = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.space.md,
})

const CartCollapsibleInner = styled(Space)({
  paddingBlock: theme.space.md,
})

const SignButton = ({ children, loading }: PropsWithChildren<{ loading: boolean }>) => {
  return (
    <Button type="submit" loading={loading} disabled={loading}>
      <StyledSignButtonContent>
        <BankIdIcon />
        {children}
      </StyledSignButtonContent>
    </Button>
  )
}

const StyledSignButtonContent = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.sm,
  width: '100%',
})

const ErrorPrompt = styled(Text)({
  maxWidth: '42rem',
  marginLeft: 'auto',
  marginRight: 'auto',
})

export default CheckoutPage
