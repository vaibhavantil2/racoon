'use client'

import { FormEventHandler, useEffect, useState } from 'react'
import { Button, Space } from 'ui'
import { PageLink } from '@/utils/PageLink'

const HEDVIG_DEBUGGER_SSN = 'hedvig:debugger-ssn'

export const CreateSessionForm = () => {
  const [loading, setLoading] = useState(false)
  const [defaultSsn, setDefaultSsn] = useState<string | undefined>(undefined)

  useEffect(() => {
    const ssn = window.localStorage.getItem(HEDVIG_DEBUGGER_SSN)
    if (ssn) setDefaultSsn(ssn)
  }, [])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const ssn = event.currentTarget.ssn.value
    setLoading(true)
    const response = await fetch(PageLink.apiSessionCreate(ssn))
    // TODO: Handle error
    if (!response.ok) {
      setLoading(false)
      throw new Error("Couldn't create session")
    }

    window.localStorage.setItem(HEDVIG_DEBUGGER_SSN, ssn)
    window.location.href = PageLink.cart({ locale: 'se-en' }).href
  }

  return (
    <form onSubmit={handleSubmit}>
      <Space y={0.25}>
        <label>
          YYYYMMDDXXXX
          <input key={defaultSsn} defaultValue={defaultSsn} autoFocus name="ssn" />
        </label>
        <Button loading={loading}>Create session</Button>
      </Space>
    </form>
  )
}
