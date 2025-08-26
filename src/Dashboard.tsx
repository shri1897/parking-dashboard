import { Header } from "./components/header"
import { Sidebar } from "./components/sidebar"
import { DashboardContent } from "./components/dashboard-content"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-background border-r">
            <Sidebar />
          </div>
        </div>
        <main className="flex-1">
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}
