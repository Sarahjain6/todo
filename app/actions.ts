"use server"

import { cookies } from "next/headers"
import * as db from "@/lib/db"
import type { Task } from "@/lib/types"

// Authentication actions
export async function login(email: string, password: string) {
  try {
    const user = await db.getUserByEmail(email)

    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (user.password !== password) {
      return { success: false, message: "Invalid password" }
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || `/placeholder.svg?height=40&width=40`,
    }

    const cookieStore = await cookies()
    cookieStore.set("user", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true, message: "Login successful", user: sessionUser }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    try {
      const existingUser = await db.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: "Email already in use" }
      }
    } catch (error) {
      // Ignore if not found
    }

    const user = await db.createUser(name, email, password)

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || `/placeholder.svg?height=40&width=40`,
    }

    const cookieStore = await cookies()
    cookieStore.set("user", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true, message: "Registration successful", user: sessionUser }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An error occurred during registration" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("user")
  return { success: true }
}

export async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie.value)
  } catch (error) {
    return null
  }
}

// Task actions
export async function fetchTasks() {
  try {
    const tasks = await db.getTasks()
    return { success: true, tasks }
  } catch (error) {
    console.error("Fetch tasks error:", error)
    return { success: false, message: "Failed to fetch tasks" }
  }
}

export async function fetchTasksByAssignee(assigneeId: string) {
  try {
    const tasks = await db.getTasksByAssignee(assigneeId)
    return { success: true, tasks }
  } catch (error) {
    console.error("Fetch tasks by assignee error:", error)
    return { success: false, message: "Failed to fetch tasks" }
  }
}

export async function addTask(task: Omit<Task, "id">) {
  try {
    const newTask = await db.createTask(task)
    return { success: true, task: newTask }
  } catch (error) {
    console.error("Add task error:", error)
    return { success: false, message: "Failed to add task" }
  }
}

export async function updateTaskStatus(id: string, completed: boolean) {
  try {
    const updatedTask = await db.updateTask(id, { completed })
    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("Update task status error:", error)
    return { success: false, message: "Failed to update task status" }
  }
}

export async function removeTask(id: string) {
  try {
    await db.deleteTask(id)
    return { success: true }
  } catch (error) {
    console.error("Delete task error:", error)
    return { success: false, message: "Failed to delete task" }
  }
}

export async function fetchUsers() {
  try {
    const users = await db.getUsers()
    return { success: true, users }
  } catch (error) {
    console.error("Fetch users error:", error)
    return { success: false, message: "Failed to fetch users" }
  }
}
