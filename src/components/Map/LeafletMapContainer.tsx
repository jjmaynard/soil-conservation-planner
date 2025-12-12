import { LatLngExpression, MapOptions } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'

import useMapContext from './useMapContext'

export const LeafletMapContainer: React.FC<
  {
    center: LatLngExpression
    children: JSX.Element | JSX.Element[]
    zoom: number
  } & MapOptions
> = ({ ...options }) => {
  const { setMap } = useMapContext()

  return (
    <MapContainer
      ref={e => setMap && setMap(e || undefined)}
      className="absolute h-full w-full text-white outline-0"
      {...options}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      {options.children}
    </MapContainer>
  )
}
