export interface ContactRequest {
  fromName: string;
  fromLastName: string;
  replyTo: string;
  replyPhone: string;
  message: string;
}
//const API_URL = "http://localhost:5000/api/auth";
const API_URL = "https://api.mr-menus.com/api";//import.meta.env.PUBLIC_API_URL;
export class ContactService {
  static async send(data: ContactRequest) {
    const response = await fetch(
      `${API_URL}/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  }
}