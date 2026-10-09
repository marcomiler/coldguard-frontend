import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from './client'

/** First 100 assets, for pickers and name lookups; refreshed when an asset is created or edited. */
export function useAssetOptions(enabled: boolean) {
  return useQuery({
    queryKey: ['assets', 'names'],
    queryFn: () => unwrap(api.GET('/assets', { params: { query: { size: 100 } } })),
    enabled,
    staleTime: 5 * 60_000,
  })
}

/**
 * Maps asset ids to names for roles that may read assets. Operators and technicians cannot, so for
 * them (`enabled: false`) screens fall back to the short id.
 */
export function useAssetNames(enabled: boolean) {
  const { data } = useAssetOptions(enabled)
  const names = new Map(data?.items.map((asset) => [asset.id, asset.name]))
  return (assetId: string) => names.get(assetId) ?? `Unidad ${assetId.slice(0, 8)}`
}
