# 📦 Regras de Negócio - Gestão de Estoque

## Visão Geral
O sistema de gestão de estoque registra todas as movimentações de produtos, mantendo histórico completo e atualizando automaticamente a quantidade em estoque.

---

## Movimentações de Estoque

### 1. Entrada (IN)
Registra a chegada de produtos ao estoque.

**Cenários:**
- Compra de fornecedores
- Devolução de clientes
- Ajuste positivo (inventário)
- Transferência entre lojas

**Regras:**
- Quantidade deve ser positiva (> 0)
- Produto deve existir e estar ativo
- Atualiza automaticamente `stock_quantity`
- Registra preço unitário (opcional)
- Permite associar nota fiscal (reference_id)

**Efeito:**


---

### 2. Saída (OUT)
Registra a retirada de produtos do estoque.

**Cenários:**
- Venda para clientes
- Devolução para fornecedor
- Ajuste negativo (perda/roubo)
- Consumo interno

**Regras:**
- Quantidade deve ser positiva (> 0)
- Estoque deve ser suficiente (stock >= quantity)
- Produto deve existir e estar ativo
- Atualiza automaticamente `stock_quantity`

**Efeito:**


---

### 3. Ajuste (ADJUSTMENT)
Correção manual do estoque (inventário físico).

**Cenários:**
- Correção após contagem física
- Ajuste por quebra de estoque
- Regularização de divergências

**Regras:**
- Define novo valor absoluto de estoque
- Calcula diferença automaticamente
- Registra motivo no campo `notes`

**Efeito:**


## Validações Críticas

### Antes de Registrar
1. **Produto existe?** - Verifica no banco
2. **Produto ativo?** - Não permite movimentar produtos inativos
3. **Quantidade válida?** - > 0
4. **Estoque suficiente?** - Apenas para saídas

### Durante o Registro
1. **Calcula estoque anterior** - Captura valor atual
2. **Calcula novo estoque** - Baseado no tipo
3. **Cria registro** - Com histórico completo
4. **Atualiza produto** - Sincroniza `stock_quantity`

### Após o Registro
1. **Dispara alertas** - Se estoque baixo (stock <= min_stock)
2. **Registra log** - Para auditoria
3. **Atualiza relatórios** - Em tempo real

---

## Exemplos Práticos

### Entrada de Estoque
```json
POST /api/movements/entry
{
  "productId": "uuid-do-produto",
  "quantity": 10,
  "unitPrice": 25.90,
  "referenceId": "NF-12345",
  "referenceType": "INVOICE",
  "notes": "Compra de fornecedor"
}