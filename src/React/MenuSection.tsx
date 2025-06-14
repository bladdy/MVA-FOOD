import type { Menu, Categorias } from "@/Types/Restaurante";
import Food from "@/assets/svg/tools-kitchen-3.svg";
import FoodIcon from "@/components/Icons/FoodIcon";
import { ReactSVG } from 'react-svg';

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
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Menú</h2>

      {Object.entries(groupedMenu).map(([categoria, items]) => (
        <div key={categoria} className="mb-8">
          <h3 className="text-xl font-semibold text-orange-700 border-b border-orange-200 pb-1 mb-3">
            <FoodIcon/>
            {categoria}
          </h3>
          <table className="w-full text-sm text-left mb-4">
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
                      RD$ {item.price.toLocaleString("es-DO")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
