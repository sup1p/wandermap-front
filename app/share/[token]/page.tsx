import SharedTripView from "./shared-trip-view"

type PageProps = {
  params: Promise<{
    token: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  return <SharedTripView token={resolvedParams.token} />
}