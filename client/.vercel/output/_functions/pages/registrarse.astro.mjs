/* empty css                                           */
import { c as createComponent, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cUBcAsSp.mjs';
import { $ as $$Layout } from '../chunks/Layout_BfXVipIs.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const diasSemana = ["Lunes a Viernes", "Sábado", "Domingo"];
const amnidadesDisponibles = [
  { svg: "area-exterior.svg", name: "Área Exterior" },
  { svg: "delivery.svg", name: "Delivery" },
  { svg: "wifi.svg", name: "Wifi" }
];
const tiposDisponibles = [
  "Americana",
  "Pollo",
  "Comida Rápida",
  "Italiana",
  "Vegetariana"
];
const paises = ["México", "República Dominicana"];
const estados = {
  México: ["Jalisco", "CDMX"],
  "República Dominicana": ["Santo Domingo", "Santiago"]
};
const ciudades = {
  Jalisco: ["Guadalajara"],
  CDMX: ["Coyoacán"],
  "Santo Domingo": ["Naco"],
  Santiago: ["Los Jardines"]
};
const colonias = {
  Guadalajara: ["Centro", "Oblatos"],
  Naco: ["Bella Vista"],
  "Los Jardines": ["La Villa"]
};
function MultiStepRestaurantForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    tipos: [],
    descripcion: "",
    direccion: {
      pais: "",
      estado: "",
      ciudad: "",
      colonia: "",
      calle: "",
      numero: "",
      codigoPostal: ""
    },
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    horario: diasSemana.map((dia) => ({
      dia,
      apertura: "",
      cierre: ""
    })),
    amnidades: [],
    image: null,
    perfilImage: null
  });
  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateDireccion = (field, value) => setForm((prev) => ({
    ...prev,
    direccion: { ...prev.direccion, [field]: value }
  }));
  const toggleTipo = (tipo) => {
    const tipos = [...form.tipos];
    if (tipos.includes(tipo)) {
      updateField(
        "tipos",
        tipos.filter((t) => t !== tipo)
      );
    } else {
      tipos.push(tipo);
      updateField("tipos", tipos);
    }
  };
  const toggleAmenidad = (name) => {
    const actual = form.amnidades.map((a) => a.name);
    if (actual.includes(name)) {
      updateField(
        "amnidades",
        form.amnidades.filter((a) => a.name !== name)
      );
    } else {
      const nueva = amnidadesDisponibles.find((a) => a.name === name);
      updateField("amnidades", [...form.amnidades, nueva]);
    }
  };
  const handleHorarioChange = (index, field, value) => {
    const newHorario = [...form.horario];
    newHorario[index][field] = value;
    updateField("horario", newHorario);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario final:", form);
  };
  const selectedPais = form.direccion.pais;
  const selectedEstado = form.direccion.estado;
  const selectedCiudad = form.direccion.ciudad;
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      className: "max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6",
      children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-center text-orange-600", children: "Registro de Restaurante" }),
        step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Nombre:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full p-2 border rounded",
                value: form.name,
                onChange: (e) => updateField("name", e.target.value),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Teléfono:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                className: "w-full p-2 border rounded",
                value: form.phone,
                onChange: (e) => updateField("phone", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "WhatsApp:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                className: "w-full p-2 border rounded",
                value: form.whatsapp || "",
                onChange: (e) => updateField("whatsapp", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Facebook:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                className: "w-full p-2 border rounded",
                value: form.facebook || "",
                onChange: (e) => updateField("facebook", e.target.value),
                placeholder: "https://facebook.com/tu-restaurante"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Instagram:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                className: "w-full p-2 border rounded",
                value: form.instagram || "",
                onChange: (e) => updateField("instagram", e.target.value),
                placeholder: "https://instagram.com/tu-restaurante"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "TikTok:",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                className: "w-full p-2 border rounded",
                value: form.tiktok || "",
                onChange: (e) => updateField("tiktok", e.target.value),
                placeholder: "https://tiktok.com/@tu-restaurante"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Tipo(s):",
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: tiposDisponibles.map((tipo) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => toggleTipo(tipo),
                className: `px-3 py-1 rounded border ${form.tipos.includes(tipo) ? "bg-orange-600 text-white" : "bg-orange-700 text-white"}`,
                children: tipo
              },
              tipo
            )) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            "Descripción:",
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "w-full p-2 border rounded",
                value: form.descripcion,
                onChange: (e) => updateField("descripcion", e.target.value)
              }
            )
          ] })
        ] }),
        step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Dirección" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Pais" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full p-2 border rounded",
                  value: form.direccion.pais,
                  onChange: (e) => updateDireccion("pais", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona país" }),
                    paises.map((pais) => /* @__PURE__ */ jsx("option", { value: pais, children: pais }, pais))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Estado" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full p-2 border rounded",
                  value: form.direccion.estado,
                  onChange: (e) => updateDireccion("estado", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona estado" }),
                    (estados[selectedPais] || []).map((estado) => /* @__PURE__ */ jsx("option", { value: estado, children: estado }, estado))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Ciudad" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full p-2 border rounded",
                  value: form.direccion.ciudad,
                  onChange: (e) => updateDireccion("ciudad", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona ciudad" }),
                    (ciudades[selectedEstado] || []).map((ciudad) => /* @__PURE__ */ jsx("option", { value: ciudad, children: ciudad }, ciudad))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Colonia / Sector" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full p-2 border rounded",
                  value: form.direccion.colonia,
                  onChange: (e) => updateDireccion("colonia", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona colonia" }),
                    (colonias[selectedCiudad] || []).map((col) => /* @__PURE__ */ jsx("option", { value: col, children: col }, col))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Calle" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  className: "w-full p-2 border rounded",
                  value: form.direccion.calle,
                  onChange: (e) => updateDireccion("calle", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { children: "Número" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  className: "w-full p-2 border rounded",
                  value: form.direccion.numero,
                  onChange: (e) => updateDireccion("numero", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsx("label", { children: "Código Postal" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  className: "w-full p-2 border rounded",
                  value: form.direccion.codigoPostal,
                  onChange: (e) => updateDireccion("codigoPostal", e.target.value)
                }
              )
            ] })
          ] })
        ] }),
        step === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Horario de Atención" }),
          form.horario.map((h, idx) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-32", children: h.dia }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                value: h.apertura,
                onChange: (e) => handleHorarioChange(idx, "apertura", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("span", { children: "a" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                value: h.cierre,
                onChange: (e) => handleHorarioChange(idx, "cierre", e.target.value)
              }
            )
          ] }, h.dia))
        ] }),
        step === 4 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Amenidades" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: amnidadesDisponibles.map((a) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleAmenidad(a.name),
              className: `border px-3 py-1 rounded ${form.amnidades.some((am) => am.name === a.name) ? "bg-orange-600 text-white" : "bg-orange-700 text-white"}`,
              children: a.name
            },
            a.name
          )) })
        ] }),
        step === 5 && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-center text-orange-600", children: "Sube tus imágenes" }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-full", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "logo",
                className: "block text-sm font-medium text-gray-900 mb-2",
                children: "Logo"
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: form.image ? URL.createObjectURL(form.image) : "img/placeholder-logo.png",
                alt: "Vista previa del logo",
                className: "w-24 h-24 object-cover rounded-full border border-gray-300 mb-3"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "logo",
                type: "file",
                accept: "image/*",
                onChange: (e) => updateField("image", e.target.files?.[0] ?? null),
                className: "block text-sm file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-gray-200"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-full", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "perfilImage",
                className: "block text-sm font-medium text-gray-900 mb-2",
                children: "Portada"
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: form.perfilImage ? URL.createObjectURL(form.perfilImage) : "img/placeholder-portada.png",
                alt: "Vista previa portada",
                className: "w-full object-fill rounded border border-gray-300 mb-3 bg-gray-100"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "perfilImage",
                type: "file",
                accept: "image/*",
                onChange: (e) => updateField("perfilImage", e.target.files?.[0] ?? null),
                className: "block text-sm file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-gray-200"
              }
            )
          ] })
        ] }),
        step === 6 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-center text-orange-600", children: "Resumen" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-4 rounded shadow space-y-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-700 mb-1 text-lg", children: "Información general" }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Nombre:" }),
                " ",
                form.name
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Tipos:" }),
                " ",
                form.tipos.join(", ")
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Descripción:" }),
                " ",
                form.descripcion || "No proporcionada"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-700 mb-1 text-lg", children: "Contacto" }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Dirección:" }),
                " ",
                [
                  form.direccion.calle,
                  form.direccion.numero,
                  form.direccion.colonia,
                  form.direccion.ciudad,
                  form.direccion.estado,
                  form.direccion.pais,
                  form.direccion.codigoPostal
                ].filter(Boolean).join(", ") || "No proporcionada"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Teléfono:" }),
                " ",
                form.phone || "No proporcionado"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "WhatsApp:" }),
                " ",
                form.whatsapp || "No proporcionado"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Facebook:" }),
                " ",
                form.facebook || "No proporcionado"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Instagram:" }),
                " ",
                form.instagram || "No proporcionado"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "TikTok:" }),
                " ",
                form.tiktok || "No proporcionado"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-700 mb-1 text-lg", children: "Horario de atención" }),
              form.horario.map((h, idx) => /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsxs("strong", { children: [
                  h.dia,
                  ":"
                ] }),
                " ",
                h.apertura || "--",
                " a",
                " ",
                h.cierre || "--"
              ] }, idx))
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-700 mb-1 text-lg", children: "Amenidades" }),
              /* @__PURE__ */ jsx("p", { children: form.amnidades.length > 0 ? form.amnidades.map((a) => a.name).join(", ") : "Ninguna seleccionada" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-700 mb-1 text-lg", children: "Imágenes" }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Logo:" }),
                " ",
                form.image ? form.image.name : "No seleccionada"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Portada:" }),
                " ",
                form.perfilImage ? form.perfilImage.name : "No seleccionada"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-6", children: [
          step > 1 && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep((s) => s - 1),
              className: "px-4 py-2 bg-orange-600 rounded text-white",
              children: "Atrás"
            }
          ),
          step < 6 ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep((s) => s + 1),
              className: "px-4 py-2 bg-orange-600 text-white rounded",
              children: "Siguiente"
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-orange-600 text-white rounded",
              children: "Guardar"
            }
          )
        ] })
      ]
    }
  );
}

const $$Registrarse = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - Registrarse" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="min-h-screen px-6 py-24 bg-gray-50 text-gray-800"> ${renderComponent($$result2, "MultiStepForm", MultiStepRestaurantForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/React/Forms/MultiStepForm", "client:component-export": "default" })} </section> ` })}`;
}, "C:/Proyectos/MVA-FOOD/src/pages/registrarse.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/src/pages/registrarse.astro";
const $$url = "/registrarse";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Registrarse,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
