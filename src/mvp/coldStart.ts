/** PRD §03/§05：进度条上限，滑满后推荐更准 */
export const COLD_START_TARGET = 20

/** 达到该值即可解锁完整推荐列表（低于 TARGET，降低首次阻断感） */
export const COLD_START_GATE = 8

export function isColdStartComplete(swipeCount: number): boolean {
  return swipeCount >= COLD_START_GATE
}

export function coldStartRemaining(swipeCount: number): number {
  return Math.max(0, COLD_START_TARGET - swipeCount)
}
