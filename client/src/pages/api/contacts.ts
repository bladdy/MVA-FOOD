import type { APIRoute } from "astro";
import { google } from "googleapis";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const from_name = formData.get("from_name")?.toString() || "";
    const from_last_name = formData.get("from_last_name")?.toString() || "";
    const reply_to = formData.get("reply_to")?.toString() || "";
    const reply_phone = formData.get("reply_phone")?.toString() || "";
    const message = formData.get("message")?.toString() || "";

const auth = new google.auth.JWT({
  email: "mr-menus@citapp-412523.iam.gserviceaccount.com",

  key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCy96wzW45WgaCb\nDxZAYHzW+CcZVEEpUCcBXKkx4+Omgv83p5HQ2Xt6Tf1pQraUzZKATlrI1GHxSVle\nACpsQ7SAXNUzjNj9hD4rc3+2O17JPo8DnnLbWMaBmqojDJJPDBy33iQnsLmmnzVB\nqzMwbalHn686/AT71jg3naPzGDwKDBnsTdI7M7F7m4anyE8iq0w7uyIWR/bI+e1O\n5qVa08/FvXNEAeHndLpRmQSM8W+Flbut/60GT0vRdh1u+kx/v/1ZgEKKOm/fWbZl\nOFQZKmBCrCzrRxG+tTVC8sB25AZfEKlFw9QwUIRSLa3wNLDGPqXXDHlgSmEiC180\nkNR4SeArAgMBAAECggEAKZzyMtzii1XHyNYot95XmMqJmNeg8SC8eRIZG0sgZ1rF\nSiUSACxZjDYvKrcC6jWkj2XosRLFFUwXVgaW1qalhUVQo5Rn7ga+R+8qrm4+m2+K\n5G4Gyd7qBT+3uL+XE38+/DfQU1RBzq7tPLA4jlWpS0ijf4UTCZWla7UhZohniXQk\nVN4Erh/otK0vbH+v12toAUWBe/KjnIqWBRV+G1QqThCbRzIioQGOA5hUgOo93zgc\n3cSpwHqTpTGEdhRNBlmDtvMQjBfB+zfLF2hUsJLNdF8b08QbivIEaY+VjCNBVBWU\nUNrNIVz0ci79lFlPwGNbVIneRS4jupeTzLpCpfSmLQKBgQDYjnun7Eks9b2PPMn5\nShFmOMtjJ3ebq7mxnCFBVJu7Vt3q777GjcQ1gLL0mMhIHcAEmaEln4JZgsXFNx+p\nErB3I8pdgtJ+R/LQVLv9h3Ch6bnN9Mi+7Iagkr6QbG9Xuvzr15ytbtR2m/LdWlto\nK6J6wKFNqXMH2VcZQPg/uafXBQKBgQDTkH/UcX8YhGP5joocPReJA7nU7sLsdgIO\nmNlhBSod/PlDgTPQVF6P1YEe2/cclDYK2BmxQVlOANH3YCKONswj4fOf6bUrhmvf\n4x6rrWlOiyJlxM9TZlPrkwPC2THFJ6+1bSjoPe0EWACKhoeG4os9NSiSd8b2Wx6o\ngmhz0FwhbwKBgCVkVM2l6uyscdKtuGIm++IepF+2jNyARkv4nXVeWpV6Zk8Onm5C\nRELIuh2p08s/98vTixOn+yXhgqyO3BSheX7Y2zRSRm4vlimKt/sKy9PpO3/oaFEv\nHf/T1ruxPXh0fP9r902q+VyRiNnXpDjUb/WqFTAHtikAyh0+Lp8yO1zRAoGAQbPx\njweEYhfTeJBE4gozAfEvSCqyTH9FmkTr1Y6mCtQikU1RyxQ4ndC/ndbQQobg1bNR\nH1RdKLVmf73SXXo1IbutTm9lPVQsskY1ozlip+rbzuE1RgBUdaedlmifZUwy7FQv\nTRjWP/AYkuy+sCww89xLcllSZ/Xaapi9WaJOym8CgYBrYol7hwfXZ8xcUIb69T9H\nnY/E8zHRTBNed3eZiACt0sTNIlYUhoZTlTLAqBhNs+2Prl2Xq+hQfurpvNFEnR8i\nYKDn2mc/St5W4Iry60bi4aMeCn0Iixh+acEn+bj+ssmn8QtNGhxkHkv+YO+g1/on\nakZda6UBr2T0tVE+IDs1cw==\n-----END PRIVATE KEY-----\n",

  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: "1TvuXhFfBXuwivEQ3ctw-CmpUUdPMiGqVLe_aBgGaNcs",
      range: "Sheet1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("es-MX"),
            from_name,
            from_last_name,
            reply_to,
            reply_phone,
            message,
          ],
        ],
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al guardar contacto",
      }),
      {
        status: 500,
      }
    );
  }
};