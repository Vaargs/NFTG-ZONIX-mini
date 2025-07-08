export default function handler(req, res) {
    // Устанавливаем правильные CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Получаем домен из заголовков запроса
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    const manifest = {
        url: baseUrl,
        name: "NFTG-ZONIX Mini App",
        iconUrl: `${baseUrl}/icon-192.png`,
        termsOfUseUrl: baseUrl,
        privacyPolicyUrl: baseUrl
    };

    console.log('Serving TON Connect manifest:', manifest);

    res.status(200).json(manifest);
}