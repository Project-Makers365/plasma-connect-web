function SectionCard({ title, children, action, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="rounded-lg bg-red-100 p-2 text-red-600 shadow-sm">
              <Icon />
            </span>
          ) : null}
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
