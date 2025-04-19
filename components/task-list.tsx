"use client"

import { format } from "date-fns"
import { CheckCircle2, Circle, Trash2, ArrowUp, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Task, User } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  users: User[]
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export default function TaskList({ tasks, users, onToggleComplete, onDeleteTask }: TaskListProps) {
  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId) || { id: "", name: "Unassigned", avatar: "" }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3" />
      case "medium":
        return <ArrowRight className="h-3 w-3" />
      case "low":
        return null
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive border-destructive"
      case "medium":
        return "text-warning border-warning"
      case "low":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  // Sort tasks by priority (high first, then medium, then low)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  if (sortedTasks.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No tasks found. Add a new task to get started.</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedTasks.map((task) => {
        const assignee = getUserById(task.assignee)
        const isPastDue = task.dueDate < new Date() && !task.completed
        const priorityColor = getPriorityColor(task.priority)
        const priorityIcon = getPriorityIcon(task.priority)

        return (
          <Card
            key={task.id}
            className={`overflow-hidden ${task.completed ? "bg-muted/50" : ""} ${
              task.priority === "high" && !task.completed ? "border-l-4 border-l-destructive" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 h-5 w-5"
                    onClick={() => onToggleComplete(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="sr-only">{task.completed ? "Mark as incomplete" : "Mark as complete"}</span>
                  </Button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-medium leading-none ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </h3>
                      {!task.completed && (
                        <Badge variant="outline" className={`${priorityColor} text-xs`}>
                          <span className="flex items-center gap-1">
                            {priorityIcon}
                            {task.priority}
                          </span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete task</span>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{assignee.name}</span>
              </div>
              {task.dueDate && (
                <Badge variant={isPastDue ? "destructive" : "outline"}>{format(task.dueDate, "MMM d")}</Badge>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
