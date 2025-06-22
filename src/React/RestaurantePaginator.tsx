import ArrowLIcon from "@/components/Icons/ArrowLIcon";
import ArrowRIcon from "@/components/Icons/ArrowRIcon";

// components/RestaurantePaginator.tsx
interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RestaurantePaginator({ currentPage, totalPages, onPageChange }: PaginatorProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex gap-0 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-orange-600 text-white rounded-l-full hover:bg-orange-800  border-r border-white disabled:opacity-50 disabled:cursor-not-allowed "
      >
      <ArrowLIcon/>
      </button>

      {pages.map((page) => (
        <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`px-4 py-2 ${
          page === currentPage
          ? "bg-orange-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-orange-800"
          }`}
          >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-orange-600 text-white rounded-r-full hover:bg-orange-800 border-l border-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
        <ArrowRIcon/>
      </button>
    </div>
  );
}
