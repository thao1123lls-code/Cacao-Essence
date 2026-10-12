import './globals.css'
import './motion.css'
import ShopShell from '@/components/ShopShell'
import { getProducts } from '@/lib/products'

export const revalidate = 60

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts()
  return <ShopShell products={products}>{children}</ShopShell>
}
