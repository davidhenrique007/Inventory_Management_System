📊 API de Relatórios

## Visão Geral
Endpoints para obtenção de dados agregados e métricas do sistema para dashboards e relatórios.

## Base URL
```
http://localhost:3000/api/reports
```

## Autenticação
Todas as requisições devem incluir o header:
```
Authorization: Bearer {seu_token_jwt}
```

Endpoints

1. Dashboard Summary
`GET /api/reports/dashboard`

Retorna resumo geral do sistema para o dashboard principal.

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": {
      "total": 150,
      "lowStock": 12,
      "outOfStock": 3
    },
    "categories": {
      "total": 8
    },
    "stock": {
      "totalQuantity": 1250,
      "totalValue": "87500.50"
    },
    "movements": {
      "today": 25,
      "thisMonth": 320
    },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

2. Produtos com Estoque Baixo
`GET /api/reports/low-stock`

Lista produtos com estoque abaixo do mínimo.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| page | integer | Não | Número da página | 1 |
| limit | integer | Não | Itens por página | 20 |
| all | boolean | Não | Incluir todos produtos | false |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Mouse Gamer",
        "code": "MOUSE001",
        "price": 89.90,
        "stockQuantity": 2,
        "minStock": 5,
        "difference": -3,
        "status": "WARNING",
        "category": {
          "id": "uuid",
          "name": "Informática"
        }
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}

3. Últimas Movimentações
`GET /api/reports/recent-movements`

Retorna as movimentações mais recentes do sistema.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| limit | integer | Não | Número de registros | 20 |
| type | string | Não | Filtrar por tipo (IN/OUT/ADJUSTMENT) | - |
| productId | uuid | Não | Filtrar por produto | - |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "OUT",
      "typeLabel": "Saída",
      "quantity": 2,
      "previousStock": 15,
      "currentStock": 13,
      "unitPrice": 89.90,
      "totalPrice": 179.80,
      "notes": "Venda para cliente",
      "product": {
        "id": "uuid",
        "name": "Mouse Gamer",
        "code": "MOUSE001"
      },
      "user": {
        "id": "uuid",
        "name": "Administrador"
      },
      "createdAt": "2024-01-01T10:30:00.000Z"
    }
  ]
}
```

---

 4. Resumo de Movimentações por Período
`GET /api/reports/movement-summary`

**Permissão:** `admin`, `manager`

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| period | string | Não | day/week/month/year | month |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    },
    "movements": {
      "IN": {
        "count": 45,
        "quantity": 320,
        "value": "28500.00"
      },
      "OUT": {
        "count": 38,
        "quantity": 280,
        "value": "24900.00"
      },
      "ADJUSTMENT": {
        "count": 2,
        "quantity": 5,
        "value": "0.00"
      }
    }
  }
}
```

 5. Dados para Gráfico
`GET /api/reports/movement-chart`

Retorna dados formatados para gráfico de movimentações.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| days | integer | Não | Número de dias | 7 |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "label": "01/01/2024",
      "IN": 5,
      "OUT": 3,
      "ADJUSTMENT": 0
    }
  ]
}
```

 6. Top Produtos
`GET /api/reports/top-products`

**Permissão:** `admin`, `manager`

Retorna os produtos mais movimentados.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| limit | integer | Não | Número de produtos | 10 |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "productName": "Notebook Dell",
      "productCode": "NOTE001",
      "totalMoved": 45
    }
  ]
}
```

Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Erro de validação |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 500 | Erro interno do servidor |

Exemplos de Uso

 Dashboard Principal
```bash
curl -X GET "http://localhost:3000/api/reports/dashboard" \
  -H "Authorization: Bearer SEU_TOKEN"
```

 Produtos com Estoque Baixo
```bash
curl -X GET "http://localhost:3000/api/reports/low-stock?page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Últimas Movimentações
```bash
curl -X GET "http://localhost:3000/api/reports/recent-movements?limit=20" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Dados para Gráfico (últimos 30 dias)
```bash
curl -X GET "http://localhost:3000/api/reports/movement-chart?days=30" \
  -H "Authorization: Bearer SEU_TOKEN"