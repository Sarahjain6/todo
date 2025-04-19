"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, User, ArrowUp, ArrowRight, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskList from "@/components/task-list"
import AddTaskDialog from "@/components/add-task-dialog"
import { useAuth } from "@/lib/auth-context"
import { fetchTasks, fetchUsers, updateTaskStatus, removeTask, addTask } from "@/app/actions"
import type { Task } from "@/lib/types"
import type { User as UserType } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function TodoApp() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks and users from database
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Fetch tasks
        const tasksResult = await fetchTasks()
        if (tasksResult.success) {
          setTasks(
            tasksResult.tasks.map((task: any) => ({
              ...task,
              dueDate: new Date(task.due_date),
            })),
          )
        } else {
          toast({
            title: "Error",
            description: tasksResult.message || "Failed to load tasks",
            variant: "destructive",
          })
        }

        // Fetch users
        const usersResult = await fetchUsers()
        if (usersResult.success) {
          setUsers(usersResult.users)
        } else {
          toast({
            title: "Error",
            description: usersResult.message || "Failed to load users",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleAddTask = async (task: Omit<Task, "id">) => {
    try {
      // Format the task for the database
      const dbTask = {
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        completed: task.completed,
        due_date: task.dueDate.toISOString(),
        priority: task.priority,
      }

      const result = await addTask(dbTask)

      if (result.success) {
        // Add the new task to the state
        setTasks([
          ...tasks,
          {
            ...result.task,
            dueDate: new Date(result.task.due_date),
          },
        ])

        toast({
          title: "Success",
          description: "Task added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add task:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleToggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const result = await updateTaskStatus(taskId, !task.completed)

      if (result.success) {
        // Update the task in the state
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to toggle task completion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await removeTask(taskId)

      if (result.success) {
        // Remove the task from the state
        setTasks(tasks.filter((t) => t.id !== taskId))

        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Filter tasks based on active filter, priority filter, and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    if (activeFilter === "all") return matchesSearch && matchesPriority
    if (activeFilter === "completed") return task.completed && matchesSearch && matchesPriority
    if (activeFilter === "pending") return !task.completed && matchesSearch && matchesPriority
    if (activeFilter === "my-tasks" && user) return task.assignee === user.id && matchesSearch && matchesPriority
    if (activeFilter.startsWith("user-")) {
      const userId = activeFilter.replace("user-", "")
      return task.assignee === userId && matchesSearch && matchesPriority
    }
    return matchesSearch && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="w-full">
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              {user && (
                <TabsTrigger value="my-tasks" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  My Tasks
                </TabsTrigger>
              )}
              <div className="border-l mx-2 h-4 my-auto"></div>
              {users
                .filter((u) => u.id !== user?.id) // Don't show current user in the list
                .map((user) => (
                  <TabsTrigger key={user.id} value={`user-${user.id}`} className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {user.name.split(" ")[0]}
                  </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={activeFilter} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  users={users}
                  onToggleComplete={handleToggleTaskCompletion}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-shrink-0">
          <Tabs defaultValue="all" value={priorityFilter} onValueChange={setPriorityFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high" className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-destructive" />
                High
              </TabsTrigger>
              <TabsTrigger value="medium" className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-warning" />
                Medium
              </TabsTrigger>
              <TabsTrigger value="low" className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3" />
                Low
              </TabsTrigger>
            </TabsList>

            {/* Add empty TabsContent for the priority filter tabs */}
            <TabsContent value="all" className="hidden" />
            <TabsContent value="high" className="hidden" />
            <TabsContent value="medium" className="hidden" />
            <TabsContent value="low" className="hidden" />
          </Tabs>
        </div>
      </div>

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
        users={users}
        currentUser={user}
      />
    </div>
  )
}
