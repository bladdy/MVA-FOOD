// ContactForm.tsx

import { useState } from "react";
import { ContactService } from "@/Services/contactService";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setLoading(true);

  try {
    const form = e.currentTarget;

    const data = {
      fromName: (
        form.elements.namedItem("from_name") as HTMLInputElement
      ).value,

      fromLastName: (
        form.elements.namedItem("from_last_name") as HTMLInputElement
      ).value,

      replyTo: (
        form.elements.namedItem("reply_to") as HTMLInputElement
      ).value,

      replyPhone: (
        form.elements.namedItem("reply_phone") as HTMLInputElement
      ).value,

      message: (
        form.elements.namedItem("message") as HTMLTextAreaElement
      ).value,
    };

    const result = await ContactService.send(data);

    if (result.success) {
      setSuccess(true);
      form.reset();
    }
  } catch (error) {
    console.error(error);
    alert("No fue posible enviar el formulario.");
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="text-green-600 font-semibold h-full flex items-center justify-center text-lg">
        ✅ Gracias por contactarnos
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="w-full">
                <label htmlFor="firstName" className="block text-gray-700">Nombre</label
                >
                <input
                  type="text"
                  id="from_name"
                  name="from_name"
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block text-gray-700"
                  >Apellido</label
                >
                <input
                  type="text"
                  id="from_last_name"
                  name="from_last_name"
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="w-full">
                <label htmlFor="email" className="block text-gray-700"
                  >Correo Electrónico</label
                >
                <input
                  type="email"
                  id="reply_to"
                  name="reply_to"
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="phone" className="block text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  id="reply_phone"
                  name="reply_phone"
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700">Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                required></textarea>
            </div>

            <div className="flex justify-start  gap-4 items-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? "Enviando..." : "Enviar"}
            </button>
               
                {loading && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 animate-pulse">
                        <svg
                        className="w-5 h-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                        />
                        </svg>

                        Enviando mensaje...
                    </div>
                    )}
            </div>
    </form>
  );
}