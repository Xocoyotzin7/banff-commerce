import type { Metadata } from "next"

import { AdminLoginForm } from "@/components/admin/login/AdminLoginForm"

export const metadata: Metadata = {
  title: "Admin login",
  description: "Store owner access only.",
}

type PageProps = {
  searchParams?: Promise<{
    next?: string
  }> | {
    next?: string
  }
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextPath = resolvedSearchParams?.next ?? "/admin/products"

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center px-4 py-16">
      <AdminLoginForm nextPath={nextPath} />
    </main>
  )
}
