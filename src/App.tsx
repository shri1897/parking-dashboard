import Dashboard from './Dashboard'
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Dashboard />
    </ThemeProvider>
  )
}

export default App
