
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
}

const EXTERNAL_API_URL = "https://painel.all-star.digital/api/reseller";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiToken = req.headers.get('x-api-token');
    if (!apiToken) {
      return new Response(JSON.stringify({ message: "Missing x-api-token header" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Map our local function paths to the external API paths
    let targetPath = path;
    if (path === 'status') targetPath = 'status';
    else if (path === 'generate-trial') targetPath = 'generate-trial';
    else if (path === 'generate-license') targetPath = 'generate-license';
    else if (path === 'list-licenses') targetPath = 'list-licenses';
    else if (path === 'reset-hwid') targetPath = 'reset-hwid';
    else if (path === 'revoke-license') targetPath = 'revoke-license';

    const body = await req.json().catch(() => ({}));
    
    console.log(`Forwarding request to: ${EXTERNAL_API_URL}/${targetPath}`);

    const response = await fetch(`${EXTERNAL_API_URL}/${targetPath}`, {
      method: 'POST',
      headers: {
        'x-api-token': apiToken,
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
    console.error('Error in reseller-api function:', error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
