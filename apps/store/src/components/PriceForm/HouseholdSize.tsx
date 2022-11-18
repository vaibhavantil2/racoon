import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import { MouseEventHandler, useState } from 'react'
import { InputBase } from 'ui'
import { HouseholdSizeField as HouseholdSizeFieldType } from '@/services/PriceForm/Field.types'

type FieldProps = {
  field: HouseholdSizeFieldType
}

export const HouseholdSizeField = ({ field }: FieldProps) => {
  const { t } = useTranslation('purchase-form')
  const [value, setValue] = useState(field.defaultValue || 0)

  const increment: MouseEventHandler = (event) => {
    event.preventDefault()
    setValue((value) => Math.min(field.max, value + 1))
  }

  const decrement: MouseEventHandler = (event) => {
    event.preventDefault()
    setValue((value) => Math.max(value - 1, 0))
  }

  return (
    <>
      <input
        type="text"
        name={field.name}
        required={field.required}
        value={value}
        readOnly
        hidden
      />
      <InputBase label={t(field.label.key)}>
        {() => (
          <Wrapper>
            <Value>{t('HOUSEHOLD_SIZE_VALUE', { count: value })}</Value>
            <StyledButton onClick={increment}>+</StyledButton>
            <StyledButton onClick={decrement}>-</StyledButton>
          </Wrapper>
        )}
      </InputBase>
    </>
  )
}

const Wrapper = styled.div(({ theme }) => ({
  border: `1px solid ${theme.colors.gray300}`,
  borderRadius: theme.space[2],
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.colors.white,
  height: '3.5rem',
  fontSize: theme.fontSizes[3],
}))

const Value = styled.div(({ theme }) => ({
  padding: theme.space[2],
  textAlign: 'center',
  flex: 1,
  lineHeight: '2.25rem',
}))

const StyledButton = styled.button(({ theme }) => ({
  borderLeft: `1px solid ${theme.colors.gray300}`,
  width: '2.5rem',
  textAlign: 'center',
  cursor: 'pointer',
}))
