import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export default function ImageGallery({ images }) {
  const [active, setActive] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-slate-400">
        <ImageOff size={24} />
        <p className="text-sm font-medium">No images uploaded</p>
      </div>
    );
  }

  const prev = () => setActive((active + images.length - 1) % images.length);
  const next = () => setActive((active + 1) % images.length);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <img
              src={src}
              alt={`Complaint image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-fade-in">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close image"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <img
            src={images[active]}
            alt={`Image ${active + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl animate-scale-in"
          />
          <button
            type="button"
            onClick={next}
            className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
          <span className="absolute bottom-6 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
            {active + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}