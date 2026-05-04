export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    const email = payload?.record?.email;
    const source = payload?.record?.source || 'unknown';
    const created_at = payload?.record?.created_at;

    if (!email) {
      return new Response('No email in payload', { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'OrbitForecast <noreply@orbitforecast.com>',
        to: 'jwduke@gmail.com',
        subject: `New waitlist signup: ${email}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1A3A5C; margin-bottom: 8px;">New early access signup 🚀</h2>
            <p style="color: #6B6B70; margin-bottom: 24px;">Someone just joined the OrbitForecast waitlist.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #6B6B70; font-size: 14px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; font-size: 14px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #6B6B70; font-size: 14px;">Source</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; font-size: 14px;">${source}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B6B70; font-size: 14px;">Signed up</td>
                <td style="padding: 10px 0; font-weight: 500; font-size: 14px;">${new Date(created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td>
              </tr>
            </table>
            <div style="margin-top: 32px; padding: 16px; background: #FEF3DC; border-radius: 8px;">
              <p style="margin: 0; font-size: 13px; color: #8B5E0A;">View all signups in your <a href="https://supabase.com/dashboard/project/jqbnsfuacenhvhbbrmgq/editor" style="color: #1A3A5C;">Supabase dashboard</a>.</p>
            </div>
          </div>
        `
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Notify error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}