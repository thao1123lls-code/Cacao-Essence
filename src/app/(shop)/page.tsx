import type { Metadata } from 'next'
import Store from '@/components/Store'

export const revalidate = 60
export const metadata: Metadata = { alternates: { canonical: '/' } }

export default function Home() {
  return <Store />
}
