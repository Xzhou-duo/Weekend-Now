import {
  IconBuildingStore,
  IconPlant2,
  IconToolsKitchen2,
} from '@tabler/icons-react'
import type { SwipeCardModel } from '../types'

const STROKE = 1.5

export function PlaceIcon({
  name,
  className,
  size = 40,
}: {
  name: SwipeCardModel['iconName']
  className?: string
  /** 设计规范：色块内 38–42px，列表小卡可缩小 */
  size?: number
}) {
  const props = {
    size,
    stroke: STROKE,
    className,
    'aria-hidden': true as const,
  }
  switch (name) {
    case 'building-store':
      return <IconBuildingStore {...props} />
    case 'plant-2':
      return <IconPlant2 {...props} />
    case 'tools-kitchen-2':
      return <IconToolsKitchen2 {...props} />
  }
}
