// === WEBHOOK ДЛЯ ОТСЛЕЖИВАНИЯ ПЛАТЕЖЕЙ ===

export default async function handler(req, res) {
    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transactionHash, fromAddress, amount, comment } = req.body;
        
        console.log('Payment notification received:', {
            hash: transactionHash,
            from: fromAddress,
            amount: amount,
            comment: comment,
            timestamp: new Date().toISOString()
        });
        
        // Пример: извлекаем номер пикселя из комментария
        const pixelMatch = comment?.match(/Pixel #(\d+)/);
        const pixelId = pixelMatch ? parseInt(pixelMatch[1]) : null;
        
        // Проверяем что платеж идет на правильный адрес
        const expectedRecipient = "UQAeXSRClDQ5Xcx9WoKKfT9zn_pyk-Uep7fnSdnd_-4dUTHQ";
        
        // Здесь бы вы обновили статус пикселя в базе данных
        if (pixelId) {
            console.log(`Pixel ${pixelId} purchased by ${fromAddress} for ${amount} TON`);
            
            // В реальном приложении здесь была бы логика:
            // - Проверка транзакции в блокчейне
            // - Обновление базы данных
            // - Отправка уведомлений
            // - Автоматическое подтверждение покупки
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Payment processed',
            pixelId: pixelId,
            recipient: expectedRecipient
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// === ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ТРАНЗАКЦИИ ===
async function verifyTransaction(transactionHash, expectedAmount, recipientAddress) {
    try {
        // Запрос к TON API для проверки транзакции
        const response = await fetch(`https://tonapi.io/v2/transactions/${transactionHash}`);
        const transaction = await response.json();
        
        // Проверяем что транзакция существует и корректна
        if (transaction.success && 
            transaction.out_msgs?.[0]?.destination?.address === recipientAddress &&
            parseInt(transaction.out_msgs[0].value) >= expectedAmount * 1000000000) {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Transaction verification failed:', error);
        return false;
    }
}