export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-panel ${className}`} {...props}>
      {children}
    </div>
  );
};
