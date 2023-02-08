import styled from '@emotion/styled'
import { Button, mq, NeArrow, Space, Text, theme } from 'ui'
import { GridLayout } from '@/components/GridLayout/GridLayout'
import { InsuranceDocument } from '@/services/apollo/generated'

type Props = {
  heading: string
  description: string
  docs: Array<InsuranceDocument>
}

export const ProductDocuments = ({ heading, description, docs }: Props) => {
  return (
    <Layout>
      <Column>
        <Text size={{ _: 'xl', lg: 'xxl' }}>{heading}</Text>
        <Text size={{ _: 'xl', lg: 'xxl' }} color="textSecondary">
          {description}
        </Text>
      </Column>
      <Column>
        <Space y={0.5}>
          {docs.map((doc, index) => (
            <ProductDocument key={index} doc={doc} />
          ))}
        </Space>
      </Column>
    </Layout>
  )
}

const ProductDocument = ({ doc }: { doc: InsuranceDocument }) => {
  const documentType = doc.url.includes('.') ? doc.url.substring(doc.url.lastIndexOf('.') + 1) : ''

  return (
    <DownloadFileButton
      variant="secondary"
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Ellipsis>
        {doc.displayName} <DocumentType>{documentType}</DocumentType>
      </Ellipsis>

      <StyledNeArrow size="1rem" />
    </DownloadFileButton>
  )
}

const Layout = styled(GridLayout.Root)({
  gap: theme.space.lg,
  [mq.lg]: {
    gap: theme.space.md,

    // TODO: harmonize with other grid layouts
    paddingInline: theme.space.md,
  },
})

const Column = styled.div({
  gridColumn: '1 / -1',

  [mq.lg]: {
    gridColumn: 'span 6',
  },
})

const DownloadFileButton = styled(Button)({
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.space.md,
  // Counter the padding from the "DocumentType"
  paddingTop: theme.space.xs,
  height: 'auto',
  fontSize: theme.fontSizes.xl,
})

const Ellipsis = styled.span({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

const DocumentType = styled.sup({
  fontVariant: 'small-caps',
  verticalAlign: 'super',
})

const StyledNeArrow = styled(NeArrow)({
  flexShrink: 0,
  position: 'relative',
  top: theme.space.xxs,
})
