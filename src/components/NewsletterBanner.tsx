export default function NewsletterBanner() {
  return (
    <section
      className="py-16"
      style={{ background: "var(--color-accent-teal)", color: "#fff" }}
    >
      <div className="page-width">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2
              className="text-3xl mb-3"
              style={{ fontFamily: "var(--font-header)" }}
            >
              Never Miss a Release
            </h2>
            <p className="text-base opacity-80">
              Never miss out on new books, sales, and special events.
            </p>
          </div>
          <form className="flex gap-2 w-full md:w-auto md:min-w-[360px]">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-sm bg-transparent border border-white/40 text-white placeholder-white/60 focus:outline-none focus:border-white"
            />
            <button type="submit" className="btn btn--primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
