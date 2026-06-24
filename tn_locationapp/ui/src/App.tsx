import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { fetchNui } from '@/utils/fetchNui'
import { isEnvBrowser } from '@/utils/misc'

type Location = {
    id: string
    title: string
    description: string
    image: string
    coords: {
        x: number
        y: number
        z: number
    }
}

type LocationsResponse = {
    ok: boolean
    locations: Location[]
}

const browserLocations: Location[] = [
    {
        id: 'legion_square',
        title: 'Legion Square',
        description: 'Central meeting point in downtown Los Santos.',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=500&q=80',
        coords: { x: 195.17, y: -933.77, z: 30.69 },
    },
    {
        id: 'airport',
        title: 'Los Santos Airport',
        description: 'Quick waypoint to the airport.',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=500&q=80',
        coords: { x: -1037.64, y: -2737.86, z: 20.17 },
    },
    {
        id: 'paleto_bay',
        title: 'Paleto Bay',
        description: 'Northern coastal spot outside the city.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80',
        coords: { x: -129.89, y: 6386.01, z: 31.49 },
    },
]

function MapMarkerIcon({ active }: { active: boolean }) {
    return (
        <svg viewBox="0 0 44 44" className="h-8 w-8" aria-hidden="true">
            <ellipse
                cx="22"
                cy="36"
                rx="13"
                ry="4"
                fill={active ? '#30d158' : '#48484a'}
                opacity={active ? '0.95' : '0.65'}
            />
            <path
                d="M22 5c-7.1 0-12.8 5.4-12.8 12.1 0 8.6 9.4 19.6 11.8 22.2.5.6 1.5.6 2 0 2.4-2.6 11.8-13.6 11.8-22.2C34.8 10.4 29.1 5 22 5Z"
                fill={active ? '#0a84ff' : '#636366'}
            />
            <circle cx="22" cy="17.4" r="5.1" fill={active ? '#ffffff' : '#d1d1d6'} />
        </svg>
    )
}

export default function App() {
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        document.body.style.visibility = 'visible'
        document.body.style.display = 'block'
        document.body.style.backgroundColor = isEnvBrowser() ? '#050507' : 'transparent'
    }, [])

    useEffect(() => {
        let mounted = true

        async function loadLocations() {
            try {
                if (isEnvBrowser()) {
                    setLocations(browserLocations)
                    return
                }

                const response = await fetchNui<LocationsResponse>('tn-locationapp:getLocations')
                if (mounted) {
                    setLocations(response.locations ?? [])
                }
            } catch {
                if (mounted) {
                    setError(true)
                    setLocations([])
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        void loadLocations()

        return () => {
            mounted = false
        }
    }, [])

    async function setWaypoint(location: Location) {
        setSelectedId(location.id)

        if (isEnvBrowser()) {
            return
        }

        try {
            const response = await fetchNui<{ ok: boolean }>('tn-locationapp:setWaypoint', {
                id: location.id,
            })

            if (!response.ok) {
                setSelectedId(null)
            }
        } catch {
            setSelectedId(null)
        }
    }

    return (
        <main
            id="application"
            className="min-h-screen bg-[#050507] px-4 pb-5 pt-14 text-[#f5f5f7]"
        >
            <header className="mb-5">
                <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-normal">Locations</h1>
            </header>

            <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[#1c1c1e]/95 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur">
                {loading ? (
                    <div className="px-4 py-6 text-center text-[14px] font-medium text-[#8e8e93]">
                        Loading locations
                    </div>
                ) : error ? (
                    <div className="px-4 py-6 text-center text-[14px] font-medium text-[#8e8e93]">
                        Locations unavailable
                    </div>
                ) : locations.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[14px] font-medium text-[#8e8e93]">
                        No locations
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {locations.map((location) => {
                            const selected = location.id === selectedId

                            return (
                                <button
                                    key={location.id}
                                    type="button"
                                    onClick={() => void setWaypoint(location)}
                                    className={classNames(
                                        'grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 px-3 py-3 text-left',
                                        'transition active:bg-white/10',
                                    )}
                                >
                                    <img
                                        src={location.image}
                                        alt=""
                                        className="h-16 w-16 rounded-[18px] object-cover"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate text-[16px] font-semibold leading-tight">
                                            {location.title}
                                        </span>
                                        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-[#a1a1a6]">
                                            {location.description}
                                        </span>
                                    </span>
                                    <span
                                        className={classNames(
                                            'grid h-10 w-10 place-items-center rounded-full transition',
                                            selected ? 'bg-[#0a84ff]/10' : 'bg-[#2c2c2e]',
                                        )}
                                        aria-hidden="true"
                                    >
                                        <MapMarkerIcon active={selected} />
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}


