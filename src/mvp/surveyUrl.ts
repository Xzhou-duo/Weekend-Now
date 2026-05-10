/** 腾讯问卷默认链接；生产可通过 VITE_SURVEY_URL 覆盖 */
export const DEFAULT_SURVEY_URL =
  'https://wj.qq.com/s2/26624439/2a7e/'

export function getSurveyUrl(): string {
  const fromEnv = import.meta.env.VITE_SURVEY_URL?.trim()
  return fromEnv || DEFAULT_SURVEY_URL
}
