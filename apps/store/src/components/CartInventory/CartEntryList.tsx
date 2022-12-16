import styled from '@emotion/styled'
import { ReactNode } from 'react'
import { Separate } from 'ui'

type Props = { children: ReactNode }

export const CartEntryList = ({ children }: Props) => {
  return (
    <StyledCartEntryList Separator={<HorizontalLineWithSpace />}>{children}</StyledCartEntryList>
  )
}

const StyledCartEntryList = styled(Separate)({
  padding: 0,
  listStyleType: 'none',
  width: '100%',
})
StyledCartEntryList.defaultProps = { as: 'ul' }

const HorizontalLineWithSpace = styled.hr(({ theme }) => ({
  backgroundColor: theme.colors.gray300,
  height: 1,
  marginTop: theme.space[5],
  marginBottom: theme.space[5],
}))