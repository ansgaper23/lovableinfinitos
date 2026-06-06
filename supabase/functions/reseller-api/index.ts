
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
}

// Intentamos con la IP si el dominio falla, pero no tenemos la IP segura.
// Por ahora, mejoraremos el mensaje de error para el usuario.

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiToken = req.headers.get('x-api-token');
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const body = await req.json().catch(() => ({}));

    // URL del proveedor
    const targetUrl = `https://painel.all-star.digital/api/reseller/${path}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'x-api-token': apiToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("DNS/Connection Error:", error.message);
    
    // Si es un error de DNS, devolvemos un mensaje amigable
    if (error.message.includes("dns error") || error.message.includes("Name or service not known")) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Error de conexión: El dominio 'painel.all-star.digital' no es accesible desde el servidor. Verifica que la URL sea correcta o contacta al proveedor.",
      }), {
        status: 502, // Bad Gateway
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
