import Link from "next/link";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  price: string;
  image: string;
  href: string;
  onSale?: boolean;
  originalPrice?: string;
}

interface BookGridProps {
  title: string;
  viewAllHref?: string;
  books: Book[];
  columns?: 4 | 5;
}

export default function BookGrid({ title, viewAllHref, books, columns = 5 }: BookGridProps) {
  const colClass = columns === 5
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-4";

  return (
    <section className="py-12">
      <div className="page-width">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl text-white"
            style={{ fontFamily: "var(--font-header)" }}
          >
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="btn btn--outline btn--sm"
            >
              View All
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className={`grid ${colClass} gap-4`}>
          {books.map((book) => (
            <Link key={book.id} href={book.href} className="group">
              <div className="relative aspect-square overflow-hidden mb-3 bg-zinc-900">
                {book.onSale && (
                  <span
                    className="absolute top-2 left-2 z-10 text-xs px-2 py-1 uppercase tracking-widest"
                    style={{ background: "var(--color-accent-purple)", color: "#000" }}
                  >
                    Sale
                  </span>
                )}
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={columns === 5 ? "(min-width: 768px) 20vw, 50vw" : "(min-width: 768px) 25vw, 50vw"}
                />
              </div>
              <div>
                <h3
                  className="text-sm mb-1 leading-snug text-white"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {book.title}
                </h3>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {book.onSale && book.originalPrice && (
                    <span className="line-through mr-2 text-xs opacity-60">
                      {book.originalPrice}
                    </span>
                  )}
                  <span>{book.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
