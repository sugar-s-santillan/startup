
export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder = '',
  required = false,
  value,
  onChange,
  ...inputProps
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <input
        {...inputProps}
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
