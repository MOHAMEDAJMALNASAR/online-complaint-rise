import { useRef, useState } from "react";
import { ImagePlus, X, FileWarning } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

let uid = 0;
const nextId = () => `img-${Date.now()}-${uid++}`;

export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const toast = useToast();
  const [error, setError] = useState("");

  const handleFiles = (files) => {
    setError("");
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const accepted = [];
    for (const file of list) {
      if (accepted.length >= remaining) break;
      if (!/image\/(jpeg|png|gif|webp)/.test(file.type)) {
        toast.error(`"${file.name}" is not a supported image type.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds ${MAX_SIZE_MB}MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    const newItems = accepted.map((file) => ({
      id: nextId(),
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...newItems]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id) => {
    const target = images.find((i) => i.id === id);
    if (target?.preview) URL.revokeObjectURL(target.preview);
    onChange(images.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <ImagePlus size={22} />
        </span>
        <p className="text-sm font-medium text-slate-600">
          Click or drag images here to upload
        </p>
        <p className="text-xs text-slate-400">
          JPEG, PNG, GIF or WEBP · up to {MAX_IMAGES} images · {MAX_SIZE_MB}MB max each
        </p>
        <span className="btn-outline mt-1 !px-3 !py-1.5 text-xs">Choose Images</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <FileWarning size={15} /> {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <img
                src={img.preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white shadow transition-colors hover:bg-rose-600"
                aria-label={`Remove image ${index + 1}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}