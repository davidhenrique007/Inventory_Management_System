Write-Host "🚀 TESTANDO API MANUALMENTE" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Teste 1: Health check
Write-Host "
📊 Teste 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Health OK:" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Erro no Health:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Teste 2: Login
Write-Host "
🔐 Teste 2: Login" -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@test.com"
        password = "123456"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"

    Write-Host "✅ Login OK:" -ForegroundColor Green
    $login | ConvertTo-Json

    # Salvar token
    $token = $login.data.tokens.accessToken
    Write-Host "
🔑 Token salvo!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no Login:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# Teste 3: Criar categoria (se login funcionou)
if ($token) {
    Write-Host "
📁 Teste 3: Criar Categoria" -ForegroundColor Yellow
    try {
        $catBody = @{
            name = "Teste PowerShell"
        } | ConvertTo-Json

        $categoria = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body $catBody -ContentType "application/json"

        Write-Host "✅ Categoria criada:" -ForegroundColor Green
        $categoria | ConvertTo-Json
        
        # Salvar ID da categoria
        $catId = $categoria.data.id
        Write-Host "
🆔 ID da categoria: $catId" -ForegroundColor Cyan
        
        # Teste 4: Listar categorias
        Write-Host "
📋 Teste 4: Listar Categorias" -ForegroundColor Yellow
        $lista = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method Get -Headers @{ Authorization = "Bearer $token" }
        
        Write-Host "✅ Categorias encontradas: $($lista.data.categories.Count)" -ForegroundColor Green
        
        # Teste 5: Buscar por ID
        Write-Host "
🔍 Teste 5: Buscar por ID" -ForegroundColor Yellow
        $busca = Invoke-RestMethod -Uri "http://localhost:3000/api/categories/$catId" -Method Get -Headers @{ Authorization = "Bearer $token" }
        
        Write-Host "✅ Categoria encontrada: $($busca.data.name)" -ForegroundColor Green
        
        # Teste 6: Atualizar categoria
        Write-Host "
✏️ Teste 6: Atualizar Categoria" -ForegroundColor Yellow
        $updateBody = @{
            name = "Teste Atualizado"
        } | ConvertTo-Json
        
        $atualizada = Invoke-RestMethod -Uri "http://localhost:3000/api/categories/$catId" -Method Put -Headers @{ Authorization = "Bearer $token" } -Body $updateBody -ContentType "application/json"
        
        Write-Host "✅ Categoria atualizada: $($atualizada.data.name)" -ForegroundColor Green
        
        # Teste 7: Deletar categoria
        Write-Host "
🗑️ Teste 7: Deletar Categoria" -ForegroundColor Yellow
        $deletada = Invoke-RestMethod -Uri "http://localhost:3000/api/categories/$catId" -Method Delete -Headers @{ Authorization = "Bearer $token" }
        
        Write-Host "✅ Categoria deletada com sucesso!" -ForegroundColor Green
        
        Write-Host "
🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
        Write-Host "============================" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Erro nas operações de categoria:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}
