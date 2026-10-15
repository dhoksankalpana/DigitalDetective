function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {Icon && (
          <div className="page-header-icon">
            <Icon size={24} />
          </div>
        )}

        <div>
          <h1 className="page-title">{title}</h1>

          {subtitle && (
            <p className="page-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="page-header-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default PageHeader;