import { API_URL } from "@/lib/apiConfig";
export interface ContactRequest {
  fromName: string;
  fromLastName: string;
  replyTo: string;
  replyPhone: string;
  message: string;
}
//const API_URL = "http://localhost:5147/api";
//const API_URL = "https://api.mr-menus.com/api";//import.meta.env.PUBLIC_API_URL;
export class ContactService {
  static async send(data: ContactRequest) {
    console.log("conect:", API_URL)
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