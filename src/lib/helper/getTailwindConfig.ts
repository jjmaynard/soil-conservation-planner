import twConfig from '#root/tailwind.config'

export const twColor = (color: string) => (twConfig.theme?.extend?.colors as any)?.[color]
