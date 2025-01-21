import type { AppProps } from 'next/app'
import { MainLayout } from '@/components/layout/main-layout'
import { StoreProvider } from '@/providers/store'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </StoreProvider>
  )
}
