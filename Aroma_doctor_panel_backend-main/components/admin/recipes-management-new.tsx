"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Search,
  List,
  Grid3x3,
  Settings2,
  ChefHat,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react"
import { Recipe, PaginationData } from "@/lib/types/recipes"
import Image from "next/image"

type ViewMode = "list" | "grid"

interface ColumnVisibility {
  image: boolean
  name: boolean
  description: boolean
  ingredients: boolean
  time: boolean
  servings: boolean
  status: boolean
}

export default function RecipesManagementNew() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    image: true,
    name: true,
    description: true,
    ingredients: true,
    time: true,
    servings: true,
    status: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteType, setDeleteType] = useState<"soft" | "permanent">("soft")

  const { toast } = useToast()

  // Initialize state from URL params and localStorage
  useEffect(() => {
    const pageParam = searchParams.get('page')
    const searchParam = searchParams.get('search')
    const viewParam = searchParams.get('view')
    const limitParam = searchParams.get('limit')

    if (pageParam) setPage(parseInt(pageParam))
    if (searchParam) setSearchTerm(searchParam)
    if (viewParam && (viewParam === 'list' || viewParam === 'grid')) setViewMode(viewParam as ViewMode)
    if (limitParam) setLimit(parseInt(limitParam))
  }, [])

  // Update URL params when state changes for persistence
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    params.set('view', viewMode)
    if (searchTerm) params.set('search', searchTerm)
    
    router.replace(`/admin/dashboard?tab=recipes&${params.toString()}`, { scroll: false })
  }, [page, limit, viewMode, searchTerm, router])

  // Load recipes
  useEffect(() => {
    loadRecipes()
  }, [page, limit])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setPage(1) // Reset to first page on search
        loadRecipes()
      } else {
        loadRecipes()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/recipes?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setRecipes(result.data || [])
        if (result.pagination) {
          setPagination(result.pagination)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load recipes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading recipes:", error)
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleViewRecipe = (recipeId: string) => {
    // Store current tab in localStorage
    localStorage.setItem('adminActiveTab', 'recipes')
    router.push(`/admin/recipes/${recipeId}/view`)
  }

  const handleEditRecipe = (recipeId: string) => {
    // Store current tab in localStorage
    localStorage.setItem('adminActiveTab', 'recipes')
    router.push(`/admin/recipes/${recipeId}/edit`)
  }

  const handleDeleteClick = (recipeId: string, recipeName: string) => {
    setRecipeToDelete({ id: recipeId, name: recipeName })
    setDeleteType("soft") // Default to soft delete
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return

    try {
      if (deleteType === "soft") {
        // Soft delete - update status to trash
        const response = await fetch(`/api/recipes/${recipeToDelete.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'trash' })
        })

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "Recipe moved to trash",
          })
          loadRecipes()
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to move recipe to trash",
            variant: "destructive",
          })
        }
      } else {
        // Permanent delete
        const response = await fetch(`/api/recipes/${recipeToDelete.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "Recipe permanently deleted",
          })
          loadRecipes()
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete recipe",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setRecipeToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Draft", variant: "secondary" },
      active: { label: "Active", variant: "default" },
      inactive: { label: "Inactive", variant: "outline" },
      trash: { label: "Trash", variant: "destructive" },
    }
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (recipes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No recipes found
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.image && <TableHead className="w-25">Image</TableHead>}
              {columnVisibility.name && <TableHead>Recipe Name</TableHead>}
              {columnVisibility.description && <TableHead>Description</TableHead>}
              {columnVisibility.ingredients && <TableHead>Ingredients</TableHead>}
              {columnVisibility.time && <TableHead className="w-25">Time</TableHead>}
              {columnVisibility.servings && <TableHead className="w-25">Servings</TableHead>}
              {columnVisibility.status && <TableHead className="w-25">Status</TableHead>}
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                {columnVisibility.image && (
                  <TableCell>
                    {recipe.imageUrl ? (
                      <div 
                        className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewRecipe(recipe.id)}
                      >
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.recipeTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewRecipe(recipe.id)}
                      >
                        <ChefHat className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                )}
                {columnVisibility.name && (
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleViewRecipe(recipe.id)}
                  >
                    {recipe.recipeTitle}
                  </TableCell>
                )}
                {columnVisibility.description && (
                  <TableCell className="max-w-xs truncate">
                    {recipe.shortDescription}
                  </TableCell>
                )}
                {columnVisibility.ingredients && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">
                        {recipe.ingredients.length} items
                      </span>
                    </div>
                  </TableCell>
                )}
                {columnVisibility.time && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{recipe.estimatedTime}m</span>
                    </div>
                  </TableCell>
                )}
                {columnVisibility.servings && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{recipe.servings}</span>
                    </div>
                  </TableCell>
                )}
                {columnVisibility.status && (
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditRecipe(recipe.id)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(recipe.id, recipe.recipeTitle)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderGridView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (recipes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No recipes found
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div 
              className="relative w-full h-48 bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleViewRecipe(recipe.id)}
            >
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.recipeTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                {getStatusBadge(recipe.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 
                className="font-semibold text-lg mb-2 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleViewRecipe(recipe.id)}
              >
                {recipe.recipeTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {recipe.shortDescription}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.estimatedTime}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>{recipe.ingredients.length} items</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditRecipe(recipe.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteClick(recipe.id, recipe.recipeTitle)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} recipes
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {pages.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className={page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recipes</h2>
        <Button className="gap-2" onClick={() => router.push('/admin/recipes/add')}>
          <Plus size={20} />
          Add Recipe
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border rounded-md p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Column Toggle (only for list view) */}
        {viewMode === "list" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              <DropdownMenuCheckboxItem
                checked={columnVisibility.image}
                onCheckedChange={() => toggleColumn("image")}
              >
                Image
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.name}
                onCheckedChange={() => toggleColumn("name")}
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.description}
                onCheckedChange={() => toggleColumn("description")}
              >
                Description
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.ingredients}
                onCheckedChange={() => toggleColumn("ingredients")}
              >
                Ingredients
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.time}
                onCheckedChange={() => toggleColumn("time")}
              >
                Time
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.servings}
                onCheckedChange={() => toggleColumn("servings")}
              >
                Servings
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.status}
                onCheckedChange={() => toggleColumn("status")}
              >
                Status
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Rows Per Page */}
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(parseInt(value))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === "list" ? renderListView() : renderGridView()}

      {/* Pagination */}
      {renderPagination()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you want to delete <strong>{recipeToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <RadioGroup value={deleteType} onValueChange={(value) => setDeleteType(value as "soft" | "permanent")}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 mb-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setDeleteType("soft")}>
                <RadioGroupItem value="soft" id="soft" />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="soft" className="cursor-pointer font-medium">
                    Move to Trash (Soft Delete)
                  </Label>
                  <p className="text-sm text-gray-500">
                    Recipe will be moved to trash status and can be restored later.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setDeleteType("permanent")}>
                <RadioGroupItem value="permanent" id="permanent" />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="permanent" className="cursor-pointer font-medium text-red-600">
                    Permanent Delete
                  </Label>
                  <p className="text-sm text-gray-500">
                    Recipe will be permanently deleted. This action cannot be undone.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={deleteType === "permanent" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {deleteType === "soft" ? "Move to Trash" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
