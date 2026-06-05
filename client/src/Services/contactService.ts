export interface ContactRequest {
  fromName: string;
  fromLastName: string;
  replyTo: string;
  replyPhone: string;
  message: string;
}

export class ContactService {
  static async send(data: ContactRequest) {
    const response = await fetch(
      "https://api.mr-menus.com/api/contact",
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