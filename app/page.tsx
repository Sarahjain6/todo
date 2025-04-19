import TodoApp from "@/components/todo-app"
import Header from "@/components/header"
import ProtectedRoute from "@/components/protected-route"

export default function Home() {
  return (
    <>
      <Header />
      <ProtectedRoute>
        <main className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">Task Management</h1>
          <TodoApp />
        </main>
      </ProtectedRoute>
    </>
  )
}
