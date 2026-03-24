-- =====================================================
-- Migration: 006_add_movement_triggers
-- Descrição: Triggers para atualização automática de estoque
-- =====================================================

DELIMITER //

-- Trigger AFTER INSERT em movements
CREATE TRIGGER trg_movements_after_insert
    AFTER INSERT ON movements
    FOR EACH ROW
BEGIN
    -- Atualizar estoque do produto
    UPDATE products 
    SET stock_quantity = NEW.current_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    -- Verificar estoque baixo (opcional)
    IF NEW.type = 'OUT' AND NEW.current_stock <= (SELECT min_stock FROM products WHERE id = NEW.product_id) THEN
        INSERT INTO low_stock_alerts (product_id, current_stock, min_stock, created_at)
        SELECT 
            NEW.product_id,
            NEW.current_stock,
            min_stock,
            CURRENT_TIMESTAMP
        FROM products p
        WHERE p.id = NEW.product_id
        AND NOT EXISTS (
            SELECT 1 FROM low_stock_alerts lsa 
            WHERE lsa.product_id = NEW.product_id 
            AND lsa.resolved_at IS NULL
        );
    END IF;
END//

-- Trigger BEFORE INSERT para validação
CREATE TRIGGER trg_movements_before_insert
    BEFORE INSERT ON movements
    FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    -- Se for saída, verificar estoque disponível
    IF NEW.type = 'OUT' THEN
        SELECT stock_quantity INTO current_stock
        FROM products 
        WHERE id = NEW.product_id;
        
        IF current_stock < NEW.quantity THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Estoque insuficiente para esta movimentação';
        END IF;
    END IF;
    
    -- Capturar estoque anterior
    SELECT stock_quantity INTO NEW.previous_stock
    FROM products 
    WHERE id = NEW.product_id;
    
    -- Calcular estoque atual
    SET NEW.current_stock = CASE 
        WHEN NEW.type = 'IN' THEN NEW.previous_stock + NEW.quantity
        WHEN NEW.type = 'OUT' THEN NEW.previous_stock - NEW.quantity
        WHEN NEW.type = 'ADJUSTMENT' THEN NEW.quantity
        ELSE NEW.previous_stock
    END;
END//

DELIMITER ;