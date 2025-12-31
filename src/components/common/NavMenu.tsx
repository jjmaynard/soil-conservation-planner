import { Compass, Github, Home, MapPin, Sprout, FileBarChart } from 'lucide-react'

import { AppConfig, NavMenuVariant } from '#lib/AppConfig'

import NavMenuItem from './NavMenuItem'

interface NavMenuProps {
  variant?: NavMenuVariant
}

const NavMenu = ({ variant = NavMenuVariant.INTRO }: NavMenuProps) => {
  const navIconSize =
    variant === NavMenuVariant.TOPNAV ? AppConfig.ui.topBarIconSize : AppConfig.ui.menuIconSize

  const listStyle =
    variant === NavMenuVariant.TOPNAV
      ? `flex text-white gap-4 text-lg text-white text-sm md:text-base`
      : `flex flex-col justify-between gap-1 w-fit text-ocean-700`

  return (
    <ul className={`${listStyle}`}>
      <NavMenuItem href="/" label="Intro" icon={<Home size={navIconSize} />} />
      <NavMenuItem href="/soil-map" label="Soil Map" icon={<MapPin size={navIconSize} />} />
      <NavMenuItem href="/field-analysis" label="Field Analysis" icon={<FileBarChart size={navIconSize} />} />
      <NavMenuItem href="/soil-health" label="Soil Health" icon={<Sprout size={navIconSize} />} />
      <NavMenuItem href="/map" label="Map Example" icon={<Compass size={navIconSize} />} />
      <NavMenuItem
        href="https://github.com/richard-unterberg/typescript-next-leaflet-starter"
        label="Github"
        icon={<Github size={navIconSize} />}
        external
      />
    </ul>
  )
}

export default NavMenu
