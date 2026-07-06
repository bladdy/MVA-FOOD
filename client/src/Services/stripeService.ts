import { API_URL } from "@/lib/apiConfig";
import type { CreateSubscriptionDto, CreateSubscriptionResponseDto } from "@/Types/Restaurante";

export const stripeService = {
  async createSubscription(data: CreateSubscriptionDto): Promise<CreateSubscriptionResponseDto> {
    const res = await fetch(`${API_URL}/Pago/create-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return res.json();
  },
};
