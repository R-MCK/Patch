import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './redesign/cottage.css'
import App from './App.tsx'

document.body.dataset.palette = 'cottage'
document.body.dataset.density = 'airy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
