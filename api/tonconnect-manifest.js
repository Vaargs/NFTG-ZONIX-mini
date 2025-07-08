export default function handler(req, res) {
    // Устанавливаем CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Обрабатываем preflight запросы
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Возвращаем манифест
    const manifest = {
        "url": "https://nftg-zonix-mini.vercel.app",
        "name": "NFTG-ZONIX Mini App", 
        "iconUrl": "https://ton.org/download/ton_symbol.png",
        "termsOfUseUrl": "https://nftg-zonix-mini.vercel.app",
        "privacyPolicyUrl": "https://nftg-zonix-mini.vercel.app"
    };

    res.status(200).json(manifest);
}