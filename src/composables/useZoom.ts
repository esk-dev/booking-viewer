import { reactive } from 'vue'
import type { ZoomLevel } from '@/types/booking'
import {
  HEIGHT_STEP,
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
  WIDTH_STEP,
} from '@/const/style.ts'

export function useZoom(initialWidth = 96, initialHeight = 50) {
  const zoomLevel = reactive<ZoomLevel>({
    cellWidth: initialWidth,
    cellHeight: initialHeight,
  })

  const zoomIn = (): void => {
    zoomLevel.cellWidth = Math.min(MAX_CELL_WIDTH, zoomLevel.cellWidth + WIDTH_STEP)
    zoomLevel.cellHeight = Math.min(MAX_CELL_HEIGHT, zoomLevel.cellHeight + HEIGHT_STEP)
  }

  const zoomOut = (): void => {
    zoomLevel.cellWidth = Math.max(MIN_CELL_WIDTH, zoomLevel.cellWidth - WIDTH_STEP)
    zoomLevel.cellHeight = Math.max(MIN_CELL_HEIGHT, zoomLevel.cellHeight - HEIGHT_STEP)
  }

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
  }
}
