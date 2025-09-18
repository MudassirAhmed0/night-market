'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Button } from "../ui/button"

type Opt = { label: string, value: string }

export default function FilterBar({ cities, categories, initial }: {
    cities: Opt[],
    categories: Opt[],
    initial: {
        city?: string,
        category?: string,
        from?: string,
        to?: string,
        pageSize: number
    }
}) {
    const router = useRouter()
    const search = useSearchParams()
    const pathname = usePathname()
    const [, startTransition] = useTransition()
    const setParams = useCallback((patch: Record<string, string | undefined>) => {
        const next = new URLSearchParams(search.toString())
        Object.entries(patch).forEach(([k, v]) => {
            if (v == undefined || v == '') next.delete(k)
            else next.set(k, v)
        })
        next.delete('page')
        startTransition(() => {
            router.replace(`${pathname}?${next.toString()}`)
        })
    }, [router, pathname, search])
    return <form aria-label='Filter events' className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end rounded-2xl border border-border  p-4 bg-card">

        <label className="text-sm space-y-1">
            <span className="block opacity-80">City</span>
            <select defaultValue={initial.city ?? ""}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2"
                onChange={(e)=> setParams({city:e.currentTarget.value || undefined})}
            >
                <option value="">All</option>
                {cities.map(city=> <option key={city.value} value={city.value}>{city.label}</option>)}
            </select>
        </label>

        <label className="text-sm space-y-1">
        <span className="block opacity-80">Category</span>
        <select
          className="w-full rounded-xl border border-border bg-bg px-3 py-2"
          defaultValue={initial.category ?? ''}
          onChange={(e) => setParams({ category: e.currentTarget.value || undefined })}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm space-y-1">
        <span className="block opacity-80">From</span>
        <input
          type="date"
          className="w-full rounded-xl border border-border bg-bg px-3 py-2"
          defaultValue={initial.from ?? ''}
          onChange={(e) => setParams({ from: e.currentTarget.value || undefined })}
        />
      </label>

   
      <label className="text-sm space-y-1">
        <span className="block opacity-80">To</span>
        <input
          type="date"
          className="w-full rounded-xl border border-border bg-bg px-3 py-2"
          defaultValue={initial.to ?? ''}
          onChange={(e) => setParams({ to: e.currentTarget.value || undefined })}
        />
      </label>

      <div className="flex gap-2">
          <Button
            type="button"
            aria-label="Reset Filters"
            variant='outline'
            className="w-full"
            onClick={()=>router.replace(pathname)}
          >
            Reset 
          </Button>
          <Button
          type="submit"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();}}
            >
                Apply
          </Button>

      </div>
    </form>
}