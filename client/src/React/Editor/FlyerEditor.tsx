import React, { useEffect, useRef, useState, useMemo } from "react";

const A4 = { w: 2480, h: 3508 }; // px a 300dpi aprox (A4 vertical)
const presets = [
  { label: "A4 Vertical (2480x3508)", w: A4.w, h: A4.h },
  { label: "A4 Horizontal (3508x2480)", w: A4.h, h: A4.w },
  { label: "1080x1350 (IG Portrait)", w: 1080, h: 1350 },
  { label: "1080x1080 (IG Cuadrado)", w: 1080, h: 1080 },
  { label: "1920x1080 (16:9)", w: 1920, h: 1080 },
  {
    label: "1080x1920 (IG Story / FB Story / WhatsApp Status)",
    w: 1080,
    h: 1920,
  },
  { label: "1200x628 (FB Post Horizontal)", w: 1200, h: 628 },
  { label: "1080x1350 (FB/IG Portrait)", w: 1080, h: 1350 },
  { label: "1080x1080 (IG/FB Square Post)", w: 1080, h: 1080 },
  { label: "820x312 (FB Cover)", w: 820, h: 312 },
  { label: "1080x608 (FB Link Share)", w: 1080, h: 608 },
  { label: "1024x512 (Twitter Post)", w: 1024, h: 512 },
];

const defaultBg = "#ffffff";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type ElementType = "text" | "rect" | "image";

interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  fitToCanvas?: boolean; // <-- Agregado
}

interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold" | "bolder" | "lighter";
  color: string;
  align: "left" | "center" | "right";
}

interface RectElement extends BaseElement {
  type: "rect";
  color: string;
}

interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  _img?: HTMLImageElement;
  id: string;
  w: number;
  h: number;
  fitToCanvas?: boolean;
}

type CanvasElement = TextElement | RectElement | ImageElement;

export default function FlyerEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 1080, h: 1350 });
  const [bg, setBg] = useState(defaultBg);
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: uid(),
      type: "text",
      x: 60,
      y: 120,
      w: 400,
      h: 60,
      text: "¡Crea tu flyer aquí!",
      fontSize: 64,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#111827",
      align: "left",
      rotation: 0,
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const selected = useMemo(
    () => elements.find((e) => e.id === selectedId) || null,
    [elements, selectedId]
  );

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      ctx.save();
      ctx.translate(el.x + (el.w || 0) / 2, el.y + (el.h || 0) / 2);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.translate(-(el.x + (el.w || 0) / 2), -(el.y + (el.h || 0) / 2));

      if (el.type === "rect") {
        ctx.fillStyle = el.color || "#000";
        ctx.fillRect(el.x, el.y, el.w, el.h);
      }

      if (el.type === "text") {
        ctx.fillStyle = el.color || "#000";
        ctx.font = `${el.fontWeight || "normal"} ${el.fontSize || 32}px ${el.fontFamily || "Arial"}`;
        ctx.textAlign = el.align || "left";
        ctx.textBaseline = "top";
        let tx = el.x;
        if (el.align === "center") tx = el.x + el.w / 2;
        if (el.align === "right") tx = el.x + el.w;
        wrapText(
          ctx,
          el.text || "",
          tx,
          el.y,
          el.w,
          (el.fontSize || 32) * 1.25
        );
      }

      if (el.type === "image" && el._img && el._img.complete) {
        ctx.drawImage(el._img, el.x, el.y, el.w, el.h);
      }
      ctx.restore();

      // Borde de selección
      if (el.id === selectedId) {
        ctx.save();
        ctx.strokeStyle = "#3b82f6";
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(el.x, el.y, el.w || 0, el.h || 0);
      }
      ctx.restore();
    });
  }, [elements, selectedId, size, bg]);

  // Eventos mouse
  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.round((e.clientX - rect.left) * (size.w / rect.width));
    const py = Math.round((e.clientY - rect.top) * (size.h / rect.height));
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (pointInElement(px, py, el)) {
        setSelectedId(el.id);
        setDrag({ id: el.id, offsetX: px - el.x, offsetY: py - el.y });
        return;
      }
    }
    setSelectedId(null);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.round((e.clientX - rect.left) * (size.w / rect.width));
    const py = Math.round((e.clientY - rect.top) * (size.h / rect.height));
    setElements((els) =>
      els.map((el) =>
        el.id !== drag.id
          ? el
          : { ...el, x: px - drag.offsetX, y: py - drag.offsetY }
      )
    );
  }

  function onMouseUp() {
    setDrag(null);
  }

  function pointInElement(px: number, py: number, el: CanvasElement) {
    const x2 = el.x + (el.w || 0);
    const y2 = el.y + (el.h || 0);
    return px >= el.x && px <= x2 && py >= el.y && py <= y2;
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, yy);
        line = words[n] + " ";
        yy += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, yy);
  }

  function addText() {
    const id = uid();
    setElements((els) =>
      els.concat({
        id,
        type: "text",
        x: 80,
        y: 80,
        w: 420,
        h: 60,
        text: "Nuevo texto",
        fontSize: 36,
        fontFamily: "Arial",
        fontWeight: "normal",
        color: "#111827",
        align: "left",
        rotation: 0,
      })
    );
    setSelectedId(id);
  }

  function addRect() {
    const id = uid();
    setElements((els) =>
      els.concat({
        id,
        type: "rect",
        x: 100,
        y: 100,
        w: 240,
        h: 140,
        color: "#22c55e",
        rotation: 0,
      })
    );
    setSelectedId(id);
  }

  function addImage(file: File) {
    const id = uid();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setElements((els) =>
        els.concat({
          id,
          type: "image",
          x: 120,
          y: 120,
          w: Math.min(img.width, 600),
          h: Math.min(img.height, 600),
          src: url,
          _img: img,
          rotation: 0,
        })
      );
      setSelectedId(id);
    };
    img.src = url;
  }

  function removeSelected() {
    if (!selectedId) return;
    setElements((els) => els.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  }

  function bringForward() {
    if (!selectedId) return;
    setElements((els) => {
      const i = els.findIndex((e) => e.id === selectedId);
      if (i < 0 || i === els.length - 1) return els;
      const copy = els.slice();
      const [sp] = copy.splice(i, 1);
      copy.splice(i + 1, 0, sp);
      return copy;
    });
  }

  function sendBackward() {
    if (!selectedId) return;
    setElements((els) => {
      const i = els.findIndex((e) => e.id === selectedId);
      if (i <= 0) return els;
      const copy = els.slice();
      const [sp] = copy.splice(i, 1);
      copy.splice(i - 1, 0, sp);
      return copy;
    });
  }
  function exportPNG() {
    if (!canvasRef.current) return;

    // Crear canvas temporal
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size.w;
    tempCanvas.height = size.h;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Dibujar elementos sin bordes de selección ni guías
    elements.forEach((el) => {
      ctx.save();
      ctx.translate(el.x + (el.w || 0) / 2, el.y + (el.h || 0) / 2);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.translate(-(el.x + (el.w || 0) / 2), -(el.y + (el.h || 0) / 2));

      if (el.type === "rect") {
        ctx.fillStyle = el.color || "#000";
        ctx.fillRect(el.x, el.y, el.w, el.h);
      }

      if (el.type === "text") {
        ctx.fillStyle = el.color || "#000";
        ctx.font = `${el.fontSize || 32}px ${el.fontFamily || "Arial"}`;
        ctx.textAlign = el.align || "left";
        ctx.textBaseline = "top";
        let tx = el.x;
        if (el.align === "center") tx = el.x + el.w / 2;
        if (el.align === "right") tx = el.x + el.w;
        wrapText(
          ctx,
          el.text || "",
          tx,
          el.y,
          el.w,
          (el.fontSize || 32) * 1.25
        );
      }

      if (el.type === "image" && el._img && el._img.complete) {
        ctx.drawImage(el._img, el.x, el.y, el.w, el.h);
      }

      // **NO dibujar ctx.strokeRect ni guías**
      ctx.restore();
    });

    // Descargar PNG
    const link = document.createElement("a");
    link.download = "flyer.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  }

  function updateSelected(
    patch: Partial<TextElement> | Partial<RectElement> | Partial<ImageElement>
  ) {
    if (!selected) return;
    setElements((els) =>
      els.map((e) => {
        if (e.id !== selected.id) return e;
        if (e.type === "text")
          return { ...e, ...(patch as Partial<TextElement>) };
        if (e.type === "rect")
          return { ...e, ...(patch as Partial<RectElement>) };
        if (e.type === "image")
          return { ...e, ...(patch as Partial<ImageElement>) };
        return e;
      })
    );
  }

  function changePreset(p: { w: number; h: number }) {
    setSize({ w: p.w, h: p.h });
    setSelectedId(null);
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "320px 1fr", alignItems: "start" }}
    >
      {/* Panel lateral */}
      <div className="panel sticky top-4 p-4 space-y-4 bg-gray-50 rounded-md shadow-sm text-white">
        {/* Preset */}
        <div className="field">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preset:
          </label>
          <select
            className="border rounded-md p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => changePreset(presets[e.target.selectedIndex])}
          >
            {presets.map((p, i) => (
              <option key={i}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Fondo */}
        <div className="field">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fondo:
          </label>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="w-12 h-8 p-1 border rounded-md cursor-pointer"
          />
          <button
            className="ml-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition"
            onClick={() => setBg(defaultBg)}
          >
            Reset
          </button>
        </div>

        {/* Botones de añadir elementos */}
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={addText}
          >
            ➕ Texto
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            onClick={addRect}
          >
            ⬛ Rectángulo
          </button>
          <label className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer">
            🖼️ Imagen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && addImage(e.target.files[0])
              }
            />
          </label>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 cursor-pointer"
            onClick={exportPNG}
          >
            {" "}
            ⬇️ Exportar PNG{" "}
          </button>{" "}
        </div>

        <hr className="my-2" />

        <h3 className="text-lg font-semibold text-gray-500">Propiedades</h3>

        {!selected && (
          <p className="text-gray-500">Selecciona un elemento del lienzo.</p>
        )}

        {/* Propiedades de texto */}
        {selected && selected.type === "text" && (
          <div className="space-y-2 text-gray-500">
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto
              </label>
              <input
                className="border rounded-md p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={selected.text}
                onChange={(e) => updateSelected({ text: e.target.value })}
              />
            </div>

            <div className="field flex flex-wrap gap-2 text-white">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Tamaño
                </label>
                <input
                  type="number"
                  min="8"
                  max="300"
                  value={selected.fontSize}
                  onChange={(e) =>
                    updateSelected({
                      fontSize: parseInt(e.target.value || "0", 10),
                    })
                  }
                  className="border rounded-md p-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Fuente
                </label>
                <select
                  value={selected.fontFamily}
                  onChange={(e) =>
                    updateSelected({ fontFamily: e.target.value })
                  }
                  className="border rounded-md p-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Negrita
                </label>
                <select
                  value={selected.fontWeight}
                  onChange={(e) =>
                    updateSelected({ fontWeight: e.target.value as any })
                  }
                  className="border text-white rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="bolder">Bolder</option>
                  <option value="lighter">Lighter</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Alineación
                </label>
                <select
                  value={selected.align}
                  onChange={(e) =>
                    updateSelected({ align: e.target.value as any })
                  }
                  className="border rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>

            <div className="field flex items-center gap-2 text-white">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={selected.color}
                onChange={(e) => updateSelected({ color: e.target.value })}
                className="w-10 h-8 p-1 border rounded-md cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Propiedades de rectángulo o imagen */}
        {selected &&
          (selected.type === "rect" || selected.type === "image") && (
            <div className="space-y-2 text-white">
              <div className="field flex gap-2">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selected.w}
                    onChange={(e) =>
                      updateSelected({ w: parseInt(e.target.value || "0", 10) })
                    }
                    className="border rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selected.h}
                    onChange={(e) =>
                      updateSelected({ h: parseInt(e.target.value || "0", 10) })
                    }
                    className="border rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div className="field flex gap-2">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Posicion (X)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selected.x}
                    onChange={(e) =>
                      updateSelected({ x: parseInt(e.target.value || "0", 10) })
                    }
                    className="border rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Posicion (Y)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selected.y}
                    onChange={(e) =>
                      updateSelected({ y: parseInt(e.target.value || "0", 10) })
                    }
                    className="border rounded-md p-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>

              {selected.type === "rect" && (
                <div className="field flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    type="color"
                    value={selected.color || "#000000"}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="w-10 h-8 p-1 border rounded-md cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

        {/* Botones de manipulación */}
        {selected && (
          <div className="space-y-2">
            <div className="field flex flex-wrap gap-2 mt-2">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                onClick={bringForward}
              >
                ⬆️ Adelante
              </button>
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                onClick={sendBackward}
              >
                ⬇️ Atrás
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                onClick={removeSelected}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lienzo */}
      <div className="panel border-black border-2" style={{ overflow: "auto" }}>
        <div style={{ width: "100%", display: "grid", justifyItems: "center" }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              maxWidth: "900px",
              background: bg,
              cursor: drag ? "grabbing" : "grab",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>
      </div>
    </div>
  );
}
