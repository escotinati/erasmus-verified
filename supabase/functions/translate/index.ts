// ─────────────────────────────────────────────────────────────
//  translate — Supabase Edge Function
//
//  Traduce un texto vía DeepL para rellenar el campo EN de los campos
//  JSONB {es, en} del admin panel (partners.description,
//  partner_events.title/description/price_label, partner_links.label).
//
//  POST { text: string, target_lang: "en" | "es" }
//  → 200 { translation: string }
//  → 4xx/5xx { error: string }
//
//  Requiere un JWT válido de Supabase en Authorization: Bearer <token>.
//  No comprueba is_admin(): el admin panel ya controla quién llega a
//  llamar a esta función, y no expone ningún dato sensible (solo hace
//  de proxy hacia DeepL para no exponer la API key en el navegador).
// ─────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
        return jsonResponse({ error: 'Método no permitido, usa POST.' }, 405);
    }

    // Validación explícita del JWT en vez de confiar solo en la
    // verificación de la plataforma (verify_jwt) — así el 401 queda
    // documentado aquí mismo, sin depender de un flag de despliegue.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return jsonResponse({ error: 'Falta el header Authorization.' }, 401);
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    );

    const {
        data: { user },
        error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        return jsonResponse({ error: 'Token inválido o expirado.' }, 401);
    }

    let body: { text?: unknown; target_lang?: unknown };
    try {
        body = await req.json();
    } catch {
        return jsonResponse({ error: 'Body inválido, se esperaba JSON.' }, 400);
    }

    const { text, target_lang: targetLang } = body;

    if (typeof text !== 'string' || !text.trim()) {
        return jsonResponse({ error: 'El campo "text" es obligatorio.' }, 400);
    }
    if (targetLang !== 'en' && targetLang !== 'es') {
        return jsonResponse({ error: 'target_lang debe ser "en" o "es".' }, 400);
    }

    const deeplKey = Deno.env.get('DEEPL_API_KEY');
    if (!deeplKey) {
        return jsonResponse({ error: 'DEEPL_API_KEY no está configurada.' }, 500);
    }

    let deeplResponse: Response;
    try {
        deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                Authorization: `DeepL-Auth-Key ${deeplKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: [text],
                target_lang: targetLang.toUpperCase(),
            }),
        });
    } catch (err) {
        return jsonResponse(
            { error: `No se pudo contactar con DeepL: ${err instanceof Error ? err.message : String(err)}` },
            502
        );
    }

    if (!deeplResponse.ok) {
        const errBody = await deeplResponse.text();
        return jsonResponse(
            { error: `DeepL respondió ${deeplResponse.status}: ${errBody}` },
            deeplResponse.status === 429 ? 429 : 502
        );
    }

    const deeplData = await deeplResponse.json();
    const translation = deeplData?.translations?.[0]?.text;

    if (typeof translation !== 'string') {
        return jsonResponse({ error: 'DeepL no devolvió ninguna traducción.' }, 502);
    }

    return jsonResponse({ translation }, 200);
});
