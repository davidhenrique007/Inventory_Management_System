-- =====================================================
-- Triggers para Atualização Automática de Estoque
-- =====================================================

DELIMITER //

-- Trigger AFTER INSERT em movements
CREATE TRIGGER trg_movements_after_insert
    AFTER INSERT ON movements
    FOR EACH ROW
BEGIN
    -- Atualizar estoque do produto
    UPDATE products 
    SET stock_quantity = CASE 
        WHEN NEW.type = 'IN' THEN stock_quantity + NEW.quantity
        WHEN NEW.type = 'OUT' THEN stock_quantity - NEW.quantity
        WHEN NEW.type = 'ADJUSTMENT' THEN NEW.current_stock
        ELSE stock_quantity
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    -- Verificar estoque baixo
    IF NEW.type = 'OUT' THEN
        INSERT INTO low_stock_alerts (product_id, current_stock, min_stock, created_at)
        SELECT 
            NEW.product_id,
            p.stock_quantity,
            p.min_stock,
            CURRENT_TIMESTAMP
        FROM products p
        WHERE p.id = NEW.product_id
        AND p.stock_quantity <= p.min_stock
        AND NOT EXISTS (
            SELECT 1 FROM low_stock_alerts lsa 
            WHERE lsa.product_id = NEW.product_id 
            AND lsa.resolved_at IS NULL
        );
    END IF;
END//

-- Trigger BEFORE INSERT para validar estoque em saídas
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
    
    -- Gerar número de movimento automaticamente
    IF NEW.movement_number IS NULL THEN
        SET NEW.movement_number = CONCAT(
            'MOV-',
            DATE_FORMAT(NOW(), '%Y%m%d-'),
            LPAD(FLOOR(RAND() * 10000), 4, '0')
        );
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

-- Trigger AFTER UPDATE para cancelamentos
CREATE TRIGGER trg_movements_after_update
    AFTER UPDATE ON movements
    FOR EACH ROW
BEGIN
    -- Se o movimento foi cancelado, reverter o estoque
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        UPDATE products 
        SET stock_quantity = CASE 
            WHEN OLD.type = 'IN' THEN stock_quantity - OLD.quantity
            WHEN OLD.type = 'OUT' THEN stock_quantity + OLD.quantity
            WHEN OLD.type = 'ADJUSTMENT' THEN OLD.previous_stock
            ELSE stock_quantity
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.product_id;
    END IF;
END//

DELIMITER ;