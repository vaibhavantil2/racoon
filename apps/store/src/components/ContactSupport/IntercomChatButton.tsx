import { datadogLogs } from '@datadog/browser-logs'
import styled from '@emotion/styled'
import { useEffect } from 'react'
import { IntercomProvider, useIntercom } from 'react-use-intercom'
import { Flags } from '@/services/Flags/Flags'

const ONE_SECOND = 1000

const INTERCOM_ENABLED = Flags.getFeature('INTERCOM')

type Props = {
  children: React.ReactNode
}

const IntercomButton = styled.button({
  cursor: 'pointer',
})

const WithIntercom = ({ children }: Props) => {
  const { show } = useIntercom()

  return <IntercomButton onClick={show}>{children}</IntercomButton>
}

export const IntercomChatButton = ({ children }: Props) => {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

  useEffect(() => {
    if (!appId) {
      datadogLogs.logger.warn('Expected env variable INTERCOM_APP_ID to be defined')
    }
  }, [appId])

  const withoutIntercom = <>{children}</>

  if (!appId) return withoutIntercom

  if (!INTERCOM_ENABLED) return withoutIntercom

  return (
    <IntercomProvider
      appId={appId}
      autoBoot
      autoBootProps={{ hideDefaultLauncher: true }}
      initializeDelay={ONE_SECOND}
    >
      <WithIntercom>{children}</WithIntercom>
    </IntercomProvider>
  )
}