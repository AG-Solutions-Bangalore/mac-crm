const PageHeader = ({
  icon: IconComponent,
  title = "Page Title",
  description = "Add a description here",
  rightContent = null,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 mb-2 shadow-sm">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="relative flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-3.5 rounded-xl bg-primary/10 flex-shrink-0 shadow-sm border border-primary/20">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
