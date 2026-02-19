/**
 * Copyright (c) 2026 MJ Cloud Tecnologia. Todos os direitos reservados.
 * Consulte o arquivo LICENSE para os termos de uso.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
