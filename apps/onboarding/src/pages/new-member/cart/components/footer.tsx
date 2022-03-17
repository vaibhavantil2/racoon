import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { LinkButton, mq } from 'ui'
import { useCurrentLocale } from '@/lib/l10n'
import { PageLink } from '@/lib/page-link'
import { MonthlyPrice, PriceProps } from './monthly-price'


export type FooterProps = PriceProps & { quoteCartId: string }

const Wrapper = styled.div({
  marginTop: '1.5rem',
  width: '100vw',
  minHeight: '5rem',
  padding: '1rem',
  position: 'sticky',
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.05), 0px -8px 16px rgba(0, 0, 0, 0.05)',

  [mq.lg]: {
    width: '50vw',
  },
})

const InnerWrapper = styled.div({
  width: '100%',
  maxWidth: '600px',
  height: '100%',
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  justifyContent: 'space-between',

  [mq.sm]: {
    padding: '0 1rem',
  },

  [mq.lg]: {
    padding: '0 2rem',
  },
})

const PriceWrapper = styled.div({})

const PriceLabel = styled.p(({ theme }) => ({
  fontSize: '0.75rem',
  lineHeight: '1rem',
  color: theme.colors.gray700,
  margin: 0,
}))

export const Footer = ({ price, quoteCartId }: FooterProps) => {
  const { t } = useTranslation()
  const { path } = useCurrentLocale()

  return (
    <Wrapper>
      <InnerWrapper>
        <PriceWrapper>
          <MonthlyPrice price={price} />
          <PriceLabel>{t('CANCEL_ANYTIME')}</PriceLabel>
        </PriceWrapper>
        <LinkButton $color="lavender" href={PageLink.old_checkout({ locale: path, quoteCartId })}>
          Continue to checkout
        </LinkButton>
      </InnerWrapper>
    </Wrapper>
  )
}
