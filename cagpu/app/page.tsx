import { redirect } from 'next/navigation'

export default function Page() {
  // Redirección server-side para evitar cualquier render en /cagpu
  redirect('/cagpu/login')
}
