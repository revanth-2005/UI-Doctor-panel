# ================================================
# Default Recipe Creation Script
# Creates default recipes in the Aroma Database
# ================================================

Write-Host "🍽️ Creating Default Recipes in Database..." -ForegroundColor Green
Write-Host ""

# Recipe 1: Grilled Chicken Salad (Diabetes)
Write-Host "📋 Creating Recipe 1: Grilled Chicken Salad (Diabetes)..." -ForegroundColor Yellow
$recipe1 = @{
    recipeTitle = "Grilled Chicken Salad"
    shortDescription = "Low-carb, high-protein meal perfect for diabetes management"
    fullDescription = "A delicious and nutritious grilled chicken salad that provides excellent protein while keeping carbohydrates low. Perfect for managing blood sugar levels."
    ingredients = @(
        @{ name = "Chicken breast"; amount = "200"; unit = "g" }
        @{ name = "Mixed greens"; amount = "100"; unit = "g" }
        @{ name = "Cherry tomatoes"; amount = "50"; unit = "g" }
        @{ name = "Cucumber"; amount = "50"; unit = "g" }
        @{ name = "Olive oil"; amount = "1"; unit = "tbsp" }
        @{ name = "Lemon juice"; amount = "1"; unit = "tbsp" }
        @{ name = "Salt and pepper"; amount = "to taste"; unit = "" }
    )
    instructions = @(
        "Season chicken breast with salt and pepper"
        "Preheat grill to medium-high heat"
        "Grill chicken for 6-8 minutes per side until fully cooked"
        "Let chicken rest for 5 minutes, then slice"
        "Wash and prepare all vegetables"
        "Combine greens, tomatoes, and cucumber in a large bowl"
        "Whisk olive oil and lemon juice together"
        "Add sliced chicken to salad"
        "Drizzle with dressing and serve immediately"
    )
    conditionTag = "Diabetes Type 2"
    nutritionInfo = @{
        calories = 295
        protein = 35
        carbs = 12
        fat = 15
        fiber = 4
        sugar = 6
    }
    estimatedTime = 25
    difficulty = "Easy"
    servings = 2
    status = "approved"
    createdBy = "admin_001"
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/recipes" -Method POST -Headers @{"Content-Type"="application/json"} -Body $recipe1
    Write-Host "✅ Recipe 1 created successfully: $($response1.data._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating Recipe 1: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Note: Make sure the MongoDB backend is running and recipe endpoints are implemented" -ForegroundColor Cyan
}

Write-Host ""

# Recipe 2: Steamed Vegetables with Quinoa (Hypertension)
Write-Host "📋 Creating Recipe 2: Steamed Vegetables with Quinoa (Hypertension)..." -ForegroundColor Yellow
$recipe2 = @{
    recipeTitle = "Steamed Vegetables with Quinoa"
    shortDescription = "Heart-healthy low-sodium meal with complete proteins"
    fullDescription = "A nutritious combination of quinoa and steamed vegetables, specially designed for people with hypertension. Low in sodium but rich in potassium and fiber."
    ingredients = @(
        @{ name = "Quinoa"; amount = "100"; unit = "g" }
        @{ name = "Broccoli florets"; amount = "150"; unit = "g" }
        @{ name = "Carrots"; amount = "100"; unit = "g" }
        @{ name = "Bell peppers"; amount = "100"; unit = "g" }
        @{ name = "Fresh herbs"; amount = "2"; unit = "tbsp" }
        @{ name = "Olive oil"; amount = "1"; unit = "tsp" }
        @{ name = "Lemon zest"; amount = "1"; unit = "tsp" }
    )
    instructions = @(
        "Rinse quinoa thoroughly under cold water"
        "Cook quinoa in 2 cups of water for 15 minutes"
        "Prepare vegetables by cutting into uniform pieces"
        "Steam vegetables for 8-10 minutes until tender-crisp"
        "Fluff quinoa with a fork"
        "Combine quinoa and steamed vegetables"
        "Drizzle with olive oil and add fresh herbs"
        "Garnish with lemon zest and serve warm"
    )
    conditionTag = "Hypertension"
    nutritionInfo = @{
        calories = 285
        protein = 12
        carbs = 45
        fat = 8
        fiber = 10
        sugar = 8
    }
    estimatedTime = 30
    difficulty = "Easy"
    servings = 2
    status = "approved"
    createdBy = "admin_001"
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/recipes" -Method POST -Headers @{"Content-Type"="application/json"} -Body $recipe2
    Write-Host "✅ Recipe 2 created successfully: $($response2.data._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating Recipe 2: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Recipe 3: Baked Salmon with Herbs (Diabetes)
Write-Host "📋 Creating Recipe 3: Baked Salmon with Herbs (Diabetes)..." -ForegroundColor Yellow
$recipe3 = @{
    recipeTitle = "Baked Salmon with Herbs"
    shortDescription = "Omega-3 rich fish with anti-inflammatory herbs"
    fullDescription = "Fresh salmon baked with Mediterranean herbs, providing essential omega-3 fatty acids and high-quality protein with minimal carbohydrates."
    ingredients = @(
        @{ name = "Salmon fillets"; amount = "200"; unit = "g" }
        @{ name = "Fresh dill"; amount = "2"; unit = "tbsp" }
        @{ name = "Fresh parsley"; amount = "2"; unit = "tbsp" }
        @{ name = "Garlic"; amount = "2"; unit = "cloves" }
        @{ name = "Olive oil"; amount = "1"; unit = "tbsp" }
        @{ name = "Lemon"; amount = "1/2"; unit = "whole" }
        @{ name = "Black pepper"; amount = "to taste"; unit = "" }
    )
    instructions = @(
        "Preheat oven to 200°C (400°F)"
        "Pat salmon fillets dry with paper towels"
        "Mince garlic and chop fresh herbs"
        "Mix olive oil, garlic, and herbs in a small bowl"
        "Place salmon on baking sheet lined with parchment"
        "Rub herb mixture over salmon fillets"
        "Squeeze lemon juice over fish and season with pepper"
        "Bake for 12-15 minutes until fish flakes easily"
        "Serve immediately with lemon wedges"
    )
    conditionTag = "Diabetes Type 2"
    nutritionInfo = @{
        calories = 320
        protein = 42
        carbs = 3
        fat = 18
        fiber = 1
        sugar = 1
    }
    estimatedTime = 20
    difficulty = "Medium"
    servings = 2
    status = "approved"
    createdBy = "admin_001"
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/recipes" -Method POST -Headers @{"Content-Type"="application/json"} -Body $recipe3
    Write-Host "✅ Recipe 3 created successfully: $($response3.data._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating Recipe 3: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Recipe 4: Mediterranean Chicken Bowl (Cardiovascular)
Write-Host "📋 Creating Recipe 4: Mediterranean Chicken Bowl (Cardiovascular)..." -ForegroundColor Yellow
$recipe4 = @{
    recipeTitle = "Mediterranean Chicken Bowl"
    shortDescription = "Heart-healthy bowl with lean protein and olive oil"
    fullDescription = "A Mediterranean-inspired bowl featuring lean chicken, fresh vegetables, and heart-healthy olive oil. Rich in antioxidants and beneficial for cardiovascular health."
    ingredients = @(
        @{ name = "Chicken thighs (skinless)"; amount = "180"; unit = "g" }
        @{ name = "Brown rice"; amount = "80"; unit = "g" }
        @{ name = "Red bell pepper"; amount = "100"; unit = "g" }
        @{ name = "Zucchini"; amount = "100"; unit = "g" }
        @{ name = "Red onion"; amount = "50"; unit = "g" }
        @{ name = "Kalamata olives"; amount = "10"; unit = "pieces" }
        @{ name = "Extra virgin olive oil"; amount = "2"; unit = "tbsp" }
        @{ name = "Fresh oregano"; amount = "1"; unit = "tbsp" }
        @{ name = "Lemon juice"; amount = "2"; unit = "tbsp" }
    )
    instructions = @(
        "Cook brown rice according to package instructions"
        "Season chicken with oregano, salt, and pepper"
        "Heat 1 tbsp olive oil in a pan over medium heat"
        "Cook chicken thighs for 6-7 minutes per side until golden"
        "Remove chicken and let rest, then slice"
        "Sauté vegetables in the same pan until tender"
        "Prepare lemon-olive oil dressing"
        "Arrange rice in bowls, top with chicken and vegetables"
        "Garnish with olives and drizzle with dressing"
    )
    conditionTag = "Cardiovascular Disease"
    nutritionInfo = @{
        calories = 420
        protein = 32
        carbs = 35
        fat = 18
        fiber = 6
        sugar = 9
    }
    estimatedTime = 35
    difficulty = "Medium"
    servings = 2
    status = "pending"
    createdBy = "admin_001"
} | ConvertTo-Json -Depth 10

try {
    $response4 = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/recipes" -Method POST -Headers @{"Content-Type"="application/json"} -Body $recipe4
    Write-Host "✅ Recipe 4 created successfully: $($response4.data._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating Recipe 4: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Recipe 5: Vegetable Lentil Soup (Hypertension)
Write-Host "📋 Creating Recipe 5: Vegetable Lentil Soup (Hypertension)..." -ForegroundColor Yellow
$recipe5 = @{
    recipeTitle = "Vegetable Lentil Soup"
    shortDescription = "Low-sodium, high-fiber soup rich in plant protein"
    fullDescription = "A hearty and nutritious lentil soup packed with vegetables. Specially formulated to be low in sodium while providing excellent plant-based protein and fiber for heart health."
    ingredients = @(
        @{ name = "Red lentils"; amount = "150"; unit = "g" }
        @{ name = "Vegetable broth (low sodium)"; amount = "500"; unit = "ml" }
        @{ name = "Carrots"; amount = "100"; unit = "g" }
        @{ name = "Celery"; amount = "100"; unit = "g" }
        @{ name = "Onion"; amount = "80"; unit = "g" }
        @{ name = "Garlic"; amount = "3"; unit = "cloves" }
        @{ name = "Tomatoes (diced)"; amount = "150"; unit = "g" }
        @{ name = "Spinach"; amount = "100"; unit = "g" }
        @{ name = "Olive oil"; amount = "1"; unit = "tbsp" }
        @{ name = "Bay leaves"; amount = "2"; unit = "pieces" }
        @{ name = "Fresh thyme"; amount = "1"; unit = "tsp" }
    )
    instructions = @(
        "Heat olive oil in a large pot over medium heat"
        "Sauté onion, carrots, and celery until softened"
        "Add garlic and cook for another minute"
        "Add lentils, broth, tomatoes, bay leaves, and thyme"
        "Bring to a boil, then reduce heat and simmer"
        "Cook for 20-25 minutes until lentils are tender"
        "Add spinach in the last 5 minutes of cooking"
        "Remove bay leaves before serving"
        "Season with herbs and serve hot"
    )
    conditionTag = "Hypertension"
    nutritionInfo = @{
        calories = 260
        protein = 18
        carbs = 45
        fat = 4
        fiber = 16
        sugar = 8
    }
    estimatedTime = 40
    difficulty = "Easy"
    servings = 3
    status = "pending"
    createdBy = "admin_001"
} | ConvertTo-Json -Depth 10

try {
    $response5 = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/recipes" -Method POST -Headers @{"Content-Type"="application/json"} -Body $response5
    Write-Host "✅ Recipe 5 created successfully: $($response5.data._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating Recipe 5: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Default recipe creation process completed!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   • Grilled Chicken Salad (Diabetes)" -ForegroundColor White
Write-Host "   • Steamed Vegetables with Quinoa (Hypertension)" -ForegroundColor White
Write-Host "   • Baked Salmon with Herbs (Diabetes)" -ForegroundColor White
Write-Host "   • Mediterranean Chicken Bowl (Cardiovascular)" -ForegroundColor White
Write-Host "   • Vegetable Lentil Soup (Hypertension)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Ensure MongoDB backend has recipe endpoints implemented" -ForegroundColor Gray
Write-Host "   2. Run this script once backend is ready" -ForegroundColor Gray
Write-Host "   3. Recipes will be available for assignment to doctors" -ForegroundColor Gray
Write-Host ""