
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiToken = req.headers.get('x-api-token');
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const body = await req.json().catch(() => ({}));

    // IP del servidor painel.all-star.digital obtenida o URL corregida
    // Intentaremos usar la URL pero con manejo de errores mejorado
    const targetUrl = `https://painel.all-star.digital/api/reseller/${path}`;
    
    console.log(`Proxying request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'x-api-token': apiToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON response from provider:", text);
      return new Response(JSON.stringify({
        success: false,
        message: "Error al comunicarse con el proveedor. Contacta soporte.",
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Connection Error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Error al comunicarse con el proveedor. Contacta soporte.",
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
