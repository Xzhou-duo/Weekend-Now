/** PRD §03/§05：冷启动累计滑卡达到该值即完成建档（与 SWIPE_DECK 张数一致） */
export const COLD_START_TARGET = 20

export function isColdStartComplete(swipeCount: number): boolean {
  return swipeCount >= COLD_START_TARGET
}

export function coldStartRemaining(swipeCount: number): number {
  return Math.max(0, COLD_START_TARGET - swipeCount)
}
