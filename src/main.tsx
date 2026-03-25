import { Provider } from "@/components/ui/provider"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StudyRecord } from './StudyRecord.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <StudyRecord />
    </Provider>
  </StrictMode>,
)
