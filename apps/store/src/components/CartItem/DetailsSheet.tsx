import styled from '@emotion/styled'
import { useTranslation } from 'next-i18next'
import { Heading, Text } from 'ui'
import { Space, theme } from 'ui'
import { CartEntry } from '@/components/CartInventory/CartInventory.types'

type Props = Pick<
  CartEntry,
  'displayItems' | 'documents' | 'tierLevelDisplayName' | 'deductibleDisplayName'
>

export const DetailsSheet = ({
  documents,
  displayItems,
  tierLevelDisplayName,
  deductibleDisplayName,
}: Props) => {
  const { t } = useTranslation('cart')

  return (
    <Root y={1}>
      <Table>
        {displayItems.map(({ title, value }) => (
          <Row key={title}>
            <Text color="textSecondary">{title}</Text>
            <Text>{value}</Text>
          </Row>
        ))}
        {tierLevelDisplayName && (
          <Row>
            <Text color="textSecondary">{t('DATA_TABLE_TIER_LABEL')}</Text>
            <Text>{tierLevelDisplayName}</Text>
          </Row>
        )}
        {deductibleDisplayName && (
          <Row>
            <Text color="textSecondary">{t('DATA_TABLE_DEDUCTIBLE_LABEL')}</Text>
            <Text>{deductibleDisplayName}</Text>
          </Row>
        )}
      </Table>

      <div>
        <Heading as="h4" color="textPrimary" mb={theme.space.md} variant="standard.18">
          {t('DOCUMENTS')}
        </Heading>
        {documents.map((item) => (
          <Row key={item.url}>
            <DocumentLink href={item.url} target="_blank" rel="noopener noreferrer">
              {item.displayName}
              <Sup> PDF</Sup>
            </DocumentLink>
          </Row>
        ))}
      </div>
    </Root>
  )
}

const Root = styled(Space)({
  paddingTop: theme.space.md,
})

const Table = styled.div({})

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const DocumentLink = styled.a({
  lineHeight: '1.6',
  '&:hover': {
    color: theme.colors.gray900,
  },
})

const Sup = styled.sup({
  verticalAlign: 'super',
  fontSize: '70%',
  lineHeight: 1,
})
