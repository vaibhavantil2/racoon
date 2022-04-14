import { css, Global } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { motion } from 'framer-motion'
import type { GetStaticProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { useState } from 'react'
import { Button, Heading, Space, mq } from 'ui'
import { HeroImage } from '@/components/hero-image'
import { PageHeaderLayout } from '@/components/page-header-layout'
import { useForm } from '@/hooks/use-form'
import { useCurrentLocale } from '@/lib/l10n'
import * as Analytics from '@/services/analytics/analytics'
import { replaceMarkdown } from '@/services/i18n'
import { Bullet, BulletList } from './components/bullet-list'
import { InputFieldWithHint } from './components/InputFieldWithHint'
import { LoadingState } from './components/loading-state'
import { RadioGroupItem } from './components/radio-group-item'
import { EntryPoint, EntryPointField, LocaleField, PersonalNumberField } from './shared'

const Grid = styled.div({
  [mq.lg]: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    height: '100vh',
  },
})

const Col = styled.div({
  [mq.lg]: {
    gridColumn: '2',
    width: '50vw',
  },
})

const Content = styled(Space)({
  '--padding-x': '1rem',
  padding: 'var(--padding-x)',
  width: '100%',
  maxWidth: 'calc(30rem + var(--padding-x) * 2)',
  margin: '0 auto',
  boxSizing: 'border-box',

  [mq.md]: {
    minHeight: 'initial',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },

  [mq.lg]: {
    '--padding-x': '2rem',
  },

  [mq.xl]: {
    paddingTop: '6rem',
  },
})

const SubHeading = styled.p(({ theme }) => ({
  lineHeight: '1.5rem',
  fontSize: '1rem',
  color: theme.colors.gray700,
  margin: 0,
  display: 'none',

  [mq.lg]: {
    display: 'block',
  },
}))

const HighlightBlock = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.gray200,
  padding: '1rem',
  borderRadius: '0.25rem',
}))

const CaptionText = styled.div(({ theme }) => ({
  fontFamily: theme.fonts.body,
  color: theme.colors.gray500,
  fontSize: '0.875rem',
  textAlign: 'center',
  maxWidth: '24rem',
  margin: '0 auto',

  a: {
    color: theme.colors.gray500,
    textDecoration: 'underline',
  },
}))

const StickyFooter = styled.div(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.colors.white,
  boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.05), 0px -8px 16px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  justifyContent: 'stretch',

  [mq.lg]: {
    position: 'static',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
}))

const FooterContent = styled.div({
  width: '100%',
  maxWidth: '600px',
  margin: 'auto',
  padding: '1rem',
  paddingBottom: '2rem',

  [mq.lg]: {
    padding: 0,
  },
})

const Spacer = styled.div({
  height: '6rem',
})

const Overlay = styled(motion.div)(() => ({
  position: 'fixed',
  zIndex: 9999,
  inset: 0,
  display: 'none',
}))

Overlay.defaultProps = {
  variants: {
    visible: {
      opacity: 1,
      display: 'block',
    },
    hidden: {
      opacity: 0,
      transitionEnd: {
        display: 'none',
      },
    },
  },
}

// Reference: https://stackoverflow.com/a/39289453
const scrollbarShiftFix = css({
  html: {
    overflowX: 'hidden',
    marginRight: 'calc(-1 * (100vw - 100%))',
  },
})

const NewMemberStartPage: NextPage = () => {
  const { path } = useCurrentLocale()
  const [entryPoint, setEntryPoint] = useState<EntryPoint>()
  const { t } = useTranslation()

  const form = useForm({
    action: '/api/pages/start',
    onSubmit: () => entryPoint && Analytics.beginOnboarding(entryPoint),
    onSuccess: ({ redirectUrl }) => {
      if (entryPoint === EntryPoint.Current && redirectUrl?.includes('/offer/') !== true) {
        Analytics.ssnFetchingFailed()
      }
    },
  })

  const personalNumberError = form.errors?.[PersonalNumberField]
  const showLoader = form.state === 'submitting' && entryPoint === EntryPoint.Current

  return (
    <>
      <Head>
        <title>{t('STARTPAGE_PAGE_TITLE')}</title>
      </Head>
      <Global styles={scrollbarShiftFix} />
      <PageHeaderLayout headerVariant="light">
        <form {...form.formProps}>
          <Grid>
            <HeroImage
              mobileImgSrc="/racoon-assets/hero_start_mobile.jpg"
              desktopImgSrc="/racoon-assets/hero_start_desktop.jpg"
            />
            <Col>
              <Content y={2}>
                <Space y={1}>
                  <Heading variant="s" headingLevel="h1" colorVariant="dark">
                    {t('START_SCREEN_HEADER')}
                  </Heading>
                  <SubHeading>{t('START_SCREEN_SUBHEADER')}</SubHeading>
                </Space>
                <RadioGroup.Root
                  name={EntryPointField}
                  value={entryPoint}
                  onValueChange={(value) => setEntryPoint(value as EntryPoint)}
                  required
                >
                  <Space y={0.5}>
                    <RadioGroupItem
                      value={EntryPoint.Current}
                      checked={entryPoint === EntryPoint.Current}
                      title={t('START_SCREEN_OPTION_CURRENT_HEADER')}
                      description={t('START_SCREEN_OPTION_CURRENT_SUBHEADER')}
                    >
                      <InputFieldWithHint
                        placeholder="YYMMDDXXXX"
                        inputMode="numeric"
                        required
                        min={10}
                        max={13}
                        name={PersonalNumberField}
                        onKeyDown={(event) => event.key === 'Enter' && form.submitForm()}
                        // https://github.com/personnummer/js
                        pattern="^(\d{2}){0,1}(\d{2})(\d{2})(\d{2})([+-]?)((?!000)\d{3})(\d)$"
                        title={t('START_SCREEN_PERSONAL_NUMBER_INPUT_TITLE')}
                        errorMessage={personalNumberError && t(personalNumberError)}
                      />
                    </RadioGroupItem>

                    <RadioGroupItem
                      value={EntryPoint.New}
                      checked={entryPoint === EntryPoint.New}
                      title={t('START_SCREEN_OPTION_NEW_HEADER')}
                      description={t('START_SCREEN_OPTION_NEW_SUBHEADER')}
                    />

                    <RadioGroupItem
                      value={EntryPoint.Switch}
                      checked={entryPoint === EntryPoint.Switch}
                      title={t('START_SCREEN_OPTION_SWITCH_HEADER')}
                      description={t('START_SCREEN_OPTION_SWITCH_SUBHEADER')}
                    >
                      <HighlightBlock>
                        <BulletList y={0.75}>
                          <Bullet>{t('START_SCREEN_OPTION_SWITCH_USP_1')}</Bullet>
                          <Bullet>{t('START_SCREEN_OPTION_SWITCH_USP_2')}</Bullet>
                          <Bullet>{t('START_SCREEN_OPTION_SWITCH_USP_3')}</Bullet>
                        </BulletList>
                      </HighlightBlock>
                    </RadioGroupItem>
                  </Space>
                </RadioGroup.Root>
                <StickyFooter>
                  <FooterContent>
                    <input hidden readOnly name={LocaleField} value={path} />
                    <Button fullWidth>{t('START_SCREEN_SUBMIT_BUTTON')}</Button>
                  </FooterContent>
                </StickyFooter>
                <CaptionText dangerouslySetInnerHTML={{ __html: t('START_SCREEN_FOOTER_TOS') }} />
              </Content>

              <Spacer />
            </Col>
          </Grid>
        </form>
      </PageHeaderLayout>

      <Overlay animate={showLoader ? 'visible' : 'hidden'}>
        <LoadingState />
      </Overlay>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const translations = await replaceMarkdown(await serverSideTranslations(locale as string), [
    'START_SCREEN_FOOTER_TOS',
  ])
  return { props: { ...translations } }
}

export default NewMemberStartPage
