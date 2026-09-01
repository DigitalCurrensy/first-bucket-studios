import { Link } from "@tanstack/react-router";
import { PlateSeal, markForHref } from "@/components/desk-mark";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={product.href}
      className="group relative block overflow-hidden rounded-xl bg-paper p-5 shadow-border transition-shadow duration-150 hover:shadow-border-hover"
    >
      <PlateSeal
        kind={markForHref(product.href)}
        className="pointer-events-none absolute -right-5 -bottom-7 size-36 text-fg/12 transition-transform duration-150 group-hover:scale-105"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-micro font-medium uppercase tracking-label text-subtle">{product.kicker}</p>
          {product.badge && (
            <span className="text-micro font-medium uppercase tracking-label text-accent">{product.badge}</span>
          )}
        </div>
        <p className="mt-3 font-display text-2xl font-semibold leading-tight opsz-deck">{product.title}</p>
        <p className="mt-2 max-w-sm text-sm text-muted">{product.body}</p>
      </div>
    </Link>
  );
}
