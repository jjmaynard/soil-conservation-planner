// TypeScript declarations for leaflet-draw

import * as L from 'leaflet'

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: DrawOptions)
      setDrawingOptions(options: DrawOptions): void
    }

    interface DrawOptions {
      position?: L.ControlPosition
      draw?: DrawConstructorOptions
      edit?: EditOptions
    }

    interface DrawConstructorOptions {
      polyline?: L.DrawOptions.PolylineOptions | false
      polygon?: L.DrawOptions.PolygonOptions | false
      rectangle?: L.DrawOptions.RectangleOptions | false
      circle?: L.DrawOptions.CircleOptions | false
      marker?: L.DrawOptions.MarkerOptions | false
      circlemarker?: L.DrawOptions.CircleMarkerOptions | false
    }

    interface EditOptions {
      featureGroup: L.FeatureGroup
      edit?: {
        selectedPathOptions?: L.PathOptions
      }
      remove?: boolean
    }
  }

  namespace DrawOptions {
    interface PolylineOptions {
      allowIntersection?: boolean
      drawError?: {
        color?: string
        message?: string
      }
      guidelineDistance?: number
      metric?: boolean
      feet?: boolean
      nautic?: boolean
      showLength?: boolean
      zIndexOffset?: number
      shapeOptions?: L.PolylineOptions
      repeatMode?: boolean
    }

    interface PolygonOptions extends PolylineOptions {
      showArea?: boolean
    }

    interface RectangleOptions {
      shapeOptions?: L.PathOptions
      showArea?: boolean
      metric?: boolean
      repeatMode?: boolean
    }

    interface CircleOptions {
      shapeOptions?: L.PathOptions
      showRadius?: boolean
      metric?: boolean
      feet?: boolean
      nautic?: boolean
      repeatMode?: boolean
    }

    interface MarkerOptions {
      icon?: L.Icon
      zIndexOffset?: number
      repeatMode?: boolean
    }

    interface CircleMarkerOptions {
      stroke?: boolean
      color?: string
      weight?: number
      opacity?: number
      fill?: boolean
      fillColor?: string
      fillOpacity?: number
      clickable?: boolean
      zIndexOffset?: number
      repeatMode?: boolean
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string
      const EDITED: string
      const DELETED: string
      const DRAWSTART: string
      const DRAWSTOP: string
      const DRAWVERTEX: string
      const EDITSTART: string
      const EDITMOVE: string
      const EDITRESIZE: string
      const EDITVERTEX: string
      const EDITSTOP: string
      const DELETESTART: string
      const DELETESTOP: string
    }
  }
}
