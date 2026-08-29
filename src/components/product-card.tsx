import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={product.href}
      className="group block rounded-xl bg-paper p-2 shadow-border transition-shadow duration-150 hover:shadow-border-hover"
    >
      <div className="relative overflow-hidden rounded-lg bg-fg">
        <img
          src={product.image}
          alt=""
          crossOrigin="anonymous"
          className="media-frame aspect-card size-full object-cover"
        />
        {product.badge && (
          <span className="absolute right-2 top-2 rounded-full bg-paper px-2 py-1 text-micro font-medium uppercase tracking-label text-fg">
            {product.badge}
          </span>
        )}
      </div>
      <div className="px-3 pb-4 pt-3">
        <p className="text-micro font-medium uppercase tracking-label text-subtle">{product.kicker}</p>
        <p className="mt-1 font-display text-xl font-semibold leading-tight">{product.title}</p>
        <p className="mt-2 text-sm text-muted">{product.body}</p>
      </div>
    </Link>
  );
}
