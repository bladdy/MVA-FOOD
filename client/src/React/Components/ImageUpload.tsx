interface Props {
  value: File | string | null;
  onChange: (file: File | null) => void;
  label: string;
  id: string;
}

export default function ImageUpload({ value, onChange, label, id }: Props) {
  const previewSrc = value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
        <input type="file" accept="image/*" id={id}
          onChange={e => onChange(e.target.files?.[0] || null)}
          className="hidden" />
        <label htmlFor={id} className="cursor-pointer block">
          {previewSrc ? (
            <img src={previewSrc} alt={label} className="w-28 h-28 object-cover rounded-lg mx-auto" />
          ) : (
            <div className="py-6 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Subir {label.toLowerCase()}</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
