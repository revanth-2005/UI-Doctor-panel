
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { success: false, message: 'Missing "to" or "body" fields' },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken || !messagingServiceSid) {
      console.error('Missing Twilio configuration');
      return NextResponse.json(
        { success: false, message: 'Server configuration error: Missing Twilio credentials' },
        { status: 500 }
      );
    }

    console.log(`Attempting to send SMS...`);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('MessagingServiceSid', messagingServiceSid);
    formData.append('Body', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API Error:', errorText);
      return NextResponse.json(
        { success: false, message: `Twilio API Error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
