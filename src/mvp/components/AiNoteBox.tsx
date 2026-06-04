import { IconAlertCircle } from '@tabler/icons-react'

export function AiNoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-block bg-danger-light p-[10px_12px]">
      <div className="mb-1 flex items-center gap-[5px]">
        <IconAlertCircle size={13} className="text-danger" aria-hidden />
        <span className="text-caption font-medium text-danger">AI 注意到</span>
      </div>
      <p className="text-body-sm leading-[1.4] text-danger-text">{children}</p>
    </div>
  )
}
