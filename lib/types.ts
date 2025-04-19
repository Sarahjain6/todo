export interface User {
  id: string
  name: string
  avatar: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  completed: boolean
  dueDate: Date
  priority: "high" | "medium" | "low"
}
