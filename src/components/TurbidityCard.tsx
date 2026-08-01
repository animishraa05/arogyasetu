// components/TurbidityCard.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TurbidityCard() {
  const [turbidity, setTurbidity] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Determine water quality
  const getQuality = (value: number) => {
    if (value < 200) return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (value < 400) return { label: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { label: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  const fetchLatest = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sensor_reading')
      .select('turbidity_reading, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) setTurbidity(data.turbidity_reading)
    else console.error('Supabase fetch error:', error)
    setLoading(false)
  }

  useEffect(() => {
    fetchLatest()
    const interval = setInterval(fetchLatest, 150000) // refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const quality = turbidity !== null ? getQuality(turbidity) : null

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Live Turbidity Reading</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : turbidity !== null ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Turbidity (NTU)</span>
              <span className="text-2xl font-bold">{turbidity}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Water Quality</span>
              <span className={`font-semibold px-2 py-1 rounded ${quality?.bgColor} ${quality?.color}`}>
                {quality?.label}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm">No data available</p>
        )}
      </div>
    </div>
  )
}
