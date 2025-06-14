import type { Menu, Categorias } from "@/Types/Restaurante";
import FoodIcon from "@/components/Icons/FoodIcon";
import { categoriaOrden } from "@/consts/categorias";

interface Props {
  menu: Menu[];
}
export default function MenuSection({ menu }: Props) {
  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<Categorias, Menu[]>);

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Menú</h2>

      {categoriaOrden.map((categoria) => {
        const items = groupedMenu[categoria];
        if (!items) return null;

        return (
          <div key={categoria} className="mb-10">
            <div className="flex items-center justify-between border-b border-orange-200 pb-1 mb-2">
              <div className="flex items-center gap-2 text-xl font-semibold text-orange-700">
                <FoodIcon className="w-6 h-6 text-orange-600" />
                {categoria}
              </div>
              <div className="text-sm font-semibold text-orange-600">Precios</div>
            </div>

            <table className="w-full text-sm text-left">
              <tbody>
                {items
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-orange-50 transition-colors"
                    >
                      <td className="py-3 px-2 w-3/5">
                        <div className="text-base font-semibold text-orange-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-orange-600">
                          {item.ingredientes}
                        </div>
                      </td>
                      <td className="py-3 px-2 w-1/5 text-right font-semibold text-orange-800 whitespace-nowrap">
                        ${item.price.toLocaleString("es-MX")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
