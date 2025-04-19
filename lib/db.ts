import { createServerSupabaseClient } from "./supabase"
import type { Task } from "./types"

// User functions
export async function getUserByEmail(email: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle() // ✅ allows zero rows without throwing error

  if (error) {
    console.error("Supabase getUserByEmail error:", error)
    throw error
  }

  return data
}

export async function createUser(name: string, email: string, password: string) {
  const supabase = createServerSupabaseClient()

  // Check if the user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle() // ✅ avoids throwing when no user is found

  if (checkError) {
    console.error("Error checking existing user:", checkError)
    throw checkError
  }

  if (existingUser) {
    console.log("User with this email already exists.")
    throw new Error("Email already in use")
  }

  // Insert the new user (plain text password for now)
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password, avatar: `/placeholder.svg?height=40&width=40` }])
    .select()
    .single()

  if (error) {
    console.error("Supabase createUser insert error:", error)
    throw error
  }

  return data
}

// Task functions
export async function getTasks() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fetch tasks error:", error)
    throw error
  }

  return data
}

export async function getTasksByAssignee(assigneeId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee", assigneeId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fetch tasks by assignee error:", error)
    throw error
  }

  return data
}

export async function createTask(task: Omit<Task, "id">) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("tasks")
    .insert([task])
    .select()
    .single()

  if (error) {
    console.error("Create task error:", error)
    throw error
  }

  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Update task error:", error)
    throw error
  }

  return data
}

export async function deleteTask(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Delete task error:", error)
    throw error
  }

  return true
}

export async function getUsers() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, avatar")

  if (error) {
    console.error("Fetch users error:", error)
    throw error
  }

  return data
}
