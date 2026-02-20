"use client"

import { use } from "react"
import RecipeForm from "@/components/admin/recipe-form"

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return <RecipeForm recipeId={id} />
}
