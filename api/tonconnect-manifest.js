export default function handler(req, res) {
    const manifest = {
        "url": "https://nftg-zonix-mini.vercel.app",
        "name": "NFTG-ZONIX Mini App",
        "iconUrl": "https://ton.org/download/ton_symbol.png",
        "termsOfUseUrl": "https://nftg-zonix-mini.vercel.app",
        "privacyPolicyUrl": "https://nftg-zonix-mini.vercel.app"
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(manifest);
}