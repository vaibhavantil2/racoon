import { datadogLogs } from '@datadog/browser-logs'
import styled from '@emotion/styled'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import { Flags } from '@/services/Flags/Flags'
const IntercomProvider = dynamic(() =>
  import('react-use-intercom').then((mod) => mod.IntercomProvider),
)

const INTERCOM_ENABLED = Flags.getFeature('INTERCOM')

type Props = {
  children: React.ReactNode
}

const WithIntercom = ({ children }: Props) => {
  const { show } = useIntercom()

  useEffect(() => {
    show()
  }, [show])

  return <IntercomButton onClick={show}>{children}</IntercomButton>
}

export const IntercomChatButton = ({ children }: Props) => {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!appId) {
      datadogLogs.logger.warn('Expected env variable INTERCOM_APP_ID to be defined')
    }
  }, [appId])

  if (!appId || !INTERCOM_ENABLED) return <>{children}</>

  if (!isLoaded)
    return <IntercomButton onClick={() => setIsLoaded(true)}>{children}</IntercomButton>

  return (
    <IntercomProvider appId={appId} autoBoot autoBootProps={{ hideDefaultLauncher: true }}>
      <WithIntercom>{children}</WithIntercom>
    </IntercomProvider>
  )
}

const IntercomButton = styled.button({
  cursor: 'pointer',
})
