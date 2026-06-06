
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

    // El dominio del proveedor parece no resolver por DNS en Deno/Edge
    // Vamos a intentar una URL alternativa o reportar el error con más detalle
    const targetUrl = `https://painel.all-star.digital/api/reseller/${path}`;
    
    console.log(`Intentando conectar a: ${targetUrl}`);

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
    return new Response(JSON.stringify({ 
      success: false, 
      message: "El servidor de licencias (painel.all-star.digital) no responde. Por favor, verifica si el dominio es correcto o intenta más tarde.",
      debug: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
