import React from 'react';

const FormInput = ({ label, type = 'text', name, value, onChange, required, placeholder, options, rows }) => {
  const style = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px',
    fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box'
  };

  return (
    <div style={{ marginBottom: '5px' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: '#555' }}>{label} {required && <span style={{color:'red'}}>*</span>}</label>}
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} required={required} style={style}>
          <option value="">Select {label}</option>
          {options && options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows || 4} style={{...style, resize: 'vertical'}} />
      ) : type === 'file' ? (
        <input type="file" name={name} onChange={onChange} accept="image/*" style={style} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} style={style} />
      )}
    </div>
  );
};

export default FormInput;
