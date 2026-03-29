import React, { useState, useEffect, useCallback } from 'react';
import { systemFlagApi } from '../api/services';

const API_BASE = process.env.REACT_APP_API_URL || 'https://astrology-i7c9.onrender.com';

const SystemFlags = () => {
  const [flagGroups, setFlagGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Track flaggroup enable/disable states (for payment gateways, buckets, etc.)
  const [flaggroupStates, setFlaggroupStates] = useState({});
  // Track video enable/disable
  const [videoToggles, setVideoToggles] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemFlagApi.getAll();
      const data = res.data.data || res.data;
      const groups = data.flagGroup || [];
      setFlagGroups(groups);
      setLanguages(data.language || []);

      // Initialize flaggroup enable/disable states
      const states = {};
      groups.forEach(g => {
        if (g.subGroup) {
          g.subGroup.forEach(sg => {
            states[sg.id] = { id: sg.id, isActive: sg.isActive ? 1 : 0 };
          });
        }
      });
      setFlaggroupStates(states);

      // Initialize video toggles
      const vt = {};
      groups.forEach(g => {
        if (g.systemFlag) {
          g.systemFlag.forEach(sf => {
            if (sf.valueType === 'Video') {
              vt[sf.name] = !!sf.value;
            }
          });
        }
      });
      setVideoToggles(vt);
    } catch (err) {
      console.error('Error fetching system flags:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Update flag value in state
  const updateFlagValue = (groupIndex, flagIndex, value, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    if (isSubGroup && subGroupIndex !== null) {
      updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex].value = value;
    } else {
      updated[groupIndex].systemFlag[flagIndex].value = value;
    }
    setFlagGroups(updated);
  };

  // Handle file to base64
  const handleFileChange = (e, groupIndex, flagIndex, isSubGroup = false, subGroupIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateFlagValue(groupIndex, flagIndex, reader.result, isSubGroup, subGroupIndex);
    };
    reader.readAsDataURL(file);
  };

  // Handle MultiSelect toggle (language IDs)
  const toggleMultiSelect = (groupIndex, flagIndex, langId, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    let flag;
    if (isSubGroup && subGroupIndex !== null) {
      flag = updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex];
    } else {
      flag = updated[groupIndex].systemFlag[flagIndex];
    }
    const currentValues = flag.value ? flag.value.split(',').filter(v => v) : [];
    const strId = String(langId);
    if (currentValues.includes(strId)) {
      flag.value = currentValues.filter(v => v !== strId).join(',');
    } else {
      flag.value = [...currentValues, strId].join(',');
    }
    setFlagGroups(updated);
  };

  // Handle MultiSelectWebLang toggle (language codes, JSON encoded)
  const toggleWebLangSelect = (groupIndex, flagIndex, langCode, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    let flag;
    if (isSubGroup && subGroupIndex !== null) {
      flag = updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex];
    } else {
      flag = updated[groupIndex].systemFlag[flagIndex];
    }
    let currentValues = [];
    try {
      currentValues = JSON.parse(flag.value || '[]');
    } catch { currentValues = []; }
    if (!Array.isArray(currentValues)) currentValues = [];

    if (currentValues.includes(langCode)) {
      flag.value = JSON.stringify(currentValues.filter(v => v !== langCode));
    } else {
      flag.value = JSON.stringify([...currentValues, langCode]);
    }
    setFlagGroups(updated);
  };

  // Save handler - send data in same structure as Laravel
  const handleSave = async () => {
    setSaving(true);
    try {
      const group = flagGroups.map((g) => {
        const groupData = { systemFlag: [], subGroup: [] };
        if (g.systemFlag && g.systemFlag.length > 0) {
          groupData.systemFlag = g.systemFlag.map(sf => {
            let val = sf.value;
            if (sf.valueType === 'MultiSelect') {
              val = sf.value ? sf.value.split(',').filter(v => v) : [];
            }
            if (sf.valueType === 'MultiSelectWebLang') {
              try { val = JSON.parse(sf.value || '[]'); } catch { val = []; }
            }
            return { name: sf.name, value: val, valueType: sf.valueType };
          });
        }
        if (g.subGroup && g.subGroup.length > 0) {
          groupData.subGroup = g.subGroup.map(sg => ({
            systemFlag: sg.systemFlag ? sg.systemFlag.map(sf => {
              let val = sf.value;
              if (sf.valueType === 'MultiSelect') {
                val = sf.value ? sf.value.split(',').filter(v => v) : [];
              }
              if (sf.valueType === 'MultiSelectWebLang') {
                try { val = JSON.parse(sf.value || '[]'); } catch { val = []; }
              }
              return { name: sf.name, value: val, valueType: sf.valueType };
            }) : []
          }));
        }
        return groupData;
      });
      await systemFlagApi.edit({ group, flaggroups: flaggroupStates });
      alert('Settings saved successfully!');
      fetchData();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  // Get radio options based on flag name - EXACT Laravel match
  const getRadioOptions = (flagName, groupIndex) => {
    // Yes/No radio flags
    const yesNoFlags = ['FirstFreeChat', 'FirstFreeChatRecharge', 'AiAstrologer', 'Callsection', 'Chatsection', 'Livesection'];
    if (yesNoFlags.includes(flagName)) {
      return [{ label: 'Yes', val: '1' }, { label: 'No', val: '0' }];
    }
    // Payment mode
    if (flagName === 'PaymentMode') {
      return [{ label: 'Razor Pay', val: 'RazorPay' }, { label: 'Stripe', val: 'Stripe' }];
    }
    // Storage provider (in ThirdPartyPackage tab)
    if (flagName === 'storege_provider') {
      return [
        { label: 'Google Bucket', val: 'google_bucket' },
        { label: 'AWS Bucket', val: 'aws_bucket' },
        { label: 'Digital Ocean', val: 'digital_ocean' },
        { label: 'Local Storage', val: 'local' }
      ];
    }
    // Streaming provider
    if (flagName === 'streaming_provider') {
      return [
        { label: 'Agora', val: 'agora' },
        { label: 'Zegocloud', val: 'zego' },
        { label: '100ms', val: 'hms' }
      ];
    }
    // Default for payment subgroup radios
    if (groupIndex !== undefined) {
      return [{ label: 'Razor Pay', val: 'RazorPay' }, { label: 'Stripe', val: 'Stripe' }];
    }
    return [{ label: 'Yes', val: '1' }, { label: 'No', val: '0' }];
  };

  // Check if subgroup should show enable/disable toggle
  // Laravel: parentFlagGroupId==2 (Payments) || id==7 || id==65 || id==66
  const shouldShowEnableDisable = (subGroup) => {
    return subGroup.parentFlagGroupId === 2 || subGroup.id === 7 || subGroup.id === 65 || subGroup.id === 66;
  };

  // Check if subgroup should be visible based on storage provider selection
  const isSubGroupVisible = (subGroup) => {
    const name = subGroup.flagGroupName ? subGroup.flagGroupName.toLowerCase() : '';
    // Find the current storage provider value
    let storageProvider = '';
    for (const g of flagGroups) {
      if (g.subGroup) {
        for (const sg of g.subGroup) {
          if (sg.systemFlag) {
            for (const sf of sg.systemFlag) {
              if (sf.name === 'storege_provider') {
                storageProvider = sf.value || '';
              }
            }
          }
        }
      }
    }
    if (storageProvider && ['google_bucket', 'aws_bucket', 'digital_ocean', 'local'].includes(name)) {
      return name === storageProvider;
    }
    return true;
  };

  // Render a single flag field based on valueType - EXACT Laravel match
  const renderFlag = (flag, groupIndex, flagIndex, isSubGroup = false, subGroupIndex = null) => {
    const { valueType, displayName, description, name, value } = flag;

    // appDesignId is hidden (Laravel: hidden inputs only)
    if (name === 'appDesignId') return null;

    if (valueType === 'Text') {
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)}
            onKeyPress={e => { if (e.key === '<' || e.key === '>') e.preventDefault(); }}
            style={styles.input}
          />
        </div>
      );
    }

    if (valueType === 'Number') {
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)}
            style={styles.input}
          />
        </div>
      );
    }

    if (valueType === 'Radio') {
      const options = getRadioOptions(name, groupIndex);
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 6 }}>
            {options.map(opt => (
              <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  checked={String(value) === String(opt.val)}
                  onChange={() => updateFlagValue(groupIndex, flagIndex, opt.val, isSubGroup, subGroupIndex)}
                  style={{ accentColor: '#7c3aed' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (valueType === 'File') {
      const imgSrc = value && value.includes('data:') ? value : (value ? `${API_BASE}/${value}` : '');
      return (
        <div key={`${name}-${flagIndex}`} style={{ display: 'inline-block', marginRight: 20, marginBottom: 16, verticalAlign: 'top' }}>
          <div style={styles.fileBox}>
            <label style={{ ...styles.label, textAlign: 'center' }}>{displayName}</label>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              {imgSrc && <img src={imgSrc} alt={displayName} style={{ width: 150, maxHeight: 150, objectFit: 'contain' }} />}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleFileChange(e, groupIndex, flagIndex, isSubGroup, subGroupIndex)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      );
    }

    if (valueType === 'MultiSelect') {
      const selectedIds = value ? value.split(',').filter(v => v) : [];
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <div style={styles.multiSelectContainer}>
            <div style={styles.multiSelectTags}>
              {selectedIds.map(id => {
                const lang = languages.find(l => String(l.id) === id);
                return lang ? (
                  <span key={id} style={styles.tag}>
                    {lang.languageName}
                    <span
                      style={styles.tagRemove}
                      onClick={() => toggleMultiSelect(groupIndex, flagIndex, id, isSubGroup, subGroupIndex)}
                    >&times;</span>
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {languages.filter(l => !selectedIds.includes(String(l.id))).map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => toggleMultiSelect(groupIndex, flagIndex, lang.id, isSubGroup, subGroupIndex)}
                  style={styles.addLangBtn}
                >
                  + {lang.languageName}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // MultiSelectWebLang - uses languageCode, JSON encoded (Laravel match)
    if (valueType === 'MultiSelectWebLang') {
      let selectedCodes = [];
      try { selectedCodes = JSON.parse(value || '[]'); } catch { selectedCodes = []; }
      if (!Array.isArray(selectedCodes)) selectedCodes = [];
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <div style={styles.multiSelectContainer}>
            <div style={styles.multiSelectTags}>
              {selectedCodes.map(code => {
                const lang = languages.find(l => l.languageCode === code);
                return (
                  <span key={code} style={styles.tag}>
                    {lang ? lang.languageName : code}
                    <span
                      style={styles.tagRemove}
                      onClick={() => toggleWebLangSelect(groupIndex, flagIndex, code, isSubGroup, subGroupIndex)}
                    >&times;</span>
                  </span>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {languages.filter(l => l.languageCode && !selectedCodes.includes(l.languageCode)).map(lang => (
                <button
                  key={lang.languageCode}
                  type="button"
                  onClick={() => toggleWebLangSelect(groupIndex, flagIndex, lang.languageCode, isSubGroup, subGroupIndex)}
                  style={styles.addLangBtn}
                >
                  + {lang.languageName}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // SelectWalletType - dropdown with Wallet/Coin (Laravel match)
    if (valueType === 'SelectWalletType') {
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>
            {displayName}
            {description && <span style={styles.tooltip} title={description}> &#9432;</span>}
          </label>
          <select
            value={value || ''}
            onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)}
            style={{ ...styles.input, cursor: value ? 'not-allowed' : 'pointer', background: value ? '#f3f4f6' : '#fff' }}
            disabled={!!value}
          >
            <option value="">Choose Wallet</option>
            <option value="Wallet">Wallet</option>
            <option value="Coin">Coin</option>
          </select>
        </div>
      );
    }

    // Video type with enable/disable toggle (Laravel BehindScenes match)
    if (valueType === 'Video') {
      const isEnabled = videoToggles[name] !== undefined ? videoToggles[name] : !!value;
      const videoSrc = value && value.includes('data:') ? value : (value ? `${API_BASE}/${value}` : '');
      return (
        <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
          <label style={styles.label}>{displayName}</label>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="radio"
                checked={isEnabled}
                onChange={() => setVideoToggles(prev => ({ ...prev, [name]: true }))}
                style={{ accentColor: '#7c3aed' }}
              />
              Enable
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="radio"
                checked={!isEnabled}
                onChange={() => {
                  setVideoToggles(prev => ({ ...prev, [name]: false }));
                  updateFlagValue(groupIndex, flagIndex, '', isSubGroup, subGroupIndex);
                }}
                style={{ accentColor: '#7c3aed' }}
              />
              Disable
            </label>
          </div>
          {isEnabled && (
            <div>
              {videoSrc && (
                <div style={{ marginBottom: 8 }}>
                  <video controls style={{ width: 150, objectFit: 'cover' }} preload="metadata">
                    <source type="video/mp4" src={videoSrc} />
                  </video>
                </div>
              )}
              <input
                type="file"
                accept="video/mp4"
                onChange={e => handleFileChange(e, groupIndex, flagIndex, isSubGroup, subGroupIndex)}
                style={{ fontSize: 13 }}
              />
            </div>
          )}
        </div>
      );
    }

    // Fallback for unknown types
    return (
      <div key={`${name}-${flagIndex}`} style={{ marginBottom: 16 }}>
        <label style={styles.label}>{displayName || name}</label>
        <input
          type="text"
          value={value || ''}
          onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)}
          style={styles.input}
        />
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading settings...</div>;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Settings</h2>
        <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabNav}>
          {flagGroups.map((group, index) => (
            <button
              key={group.id || index}
              onClick={() => setActiveTab(index)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === index ? styles.tabBtnActive : {})
              }}
            >
              {group.flagGroupName}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {flagGroups.map((group, groupIndex) => (
            <div key={group.id || groupIndex} style={{ display: activeTab === groupIndex ? 'block' : 'none' }}>
              {/* Direct system flags under group */}
              {group.systemFlag && group.systemFlag.length > 0 && (
                <div>
                  {group.systemFlag.map((flag, flagIndex) => {
                    // Laravel filters out indices 7 and 8 from the first group (General)
                    // These are typically hidden internal flags
                    return renderFlag(flag, groupIndex, flagIndex);
                  })}
                </div>
              )}

              {/* Sub groups */}
              {group.subGroup && group.subGroup.length > 0 && group.subGroup.map((subGroup, subGroupIndex) => {
                // Check visibility based on storage provider
                const visible = isSubGroupVisible(subGroup);
                return (
                  <div key={subGroup.id || subGroupIndex} style={{ display: visible ? 'block' : 'none' }}>
                    <h4 style={styles.subGroupTitle}>
                      {subGroup.flagGroupName}
                      {subGroup.description && <span style={styles.tooltip} title={subGroup.description}> &#9432;</span>}
                    </h4>

                    {/* Enable/Disable toggle for payment gateways and specific groups */}
                    {shouldShowEnableDisable(subGroup) && (
                      <div style={{ marginBottom: 10, display: 'flex', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                          <input
                            type="radio"
                            checked={flaggroupStates[subGroup.id]?.isActive === 1}
                            onChange={() => setFlaggroupStates(prev => ({
                              ...prev,
                              [subGroup.id]: { ...prev[subGroup.id], isActive: 1 }
                            }))}
                            style={{ accentColor: '#7c3aed' }}
                          />
                          Enable
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                          <input
                            type="radio"
                            checked={flaggroupStates[subGroup.id]?.isActive === 0}
                            onChange={() => setFlaggroupStates(prev => ({
                              ...prev,
                              [subGroup.id]: { ...prev[subGroup.id], isActive: 0 }
                            }))}
                            style={{ accentColor: '#7c3aed' }}
                          />
                          Disable
                        </label>
                      </div>
                    )}

                    <div style={styles.subGroupBox}>
                      {subGroup.systemFlag && subGroup.systemFlag.map((flag, flagIndex) =>
                        renderFlag(flag, groupIndex, flagIndex, true, subGroupIndex)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 600,
    fontSize: 14,
    color: '#374151'
  },
  tooltip: {
    color: '#7c3aed',
    cursor: 'help',
    fontSize: 14,
    marginLeft: 4
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box'
  },
  fileBox: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    textAlign: 'center',
    background: '#fafafa',
    minWidth: 200
  },
  multiSelectContainer: {
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: 10,
    background: '#fff'
  },
  multiSelectTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500
  },
  tagRemove: {
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 16,
    color: '#7c3aed',
    marginLeft: 4
  },
  addLangBtn: {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    padding: '3px 10px',
    fontSize: 12,
    cursor: 'pointer',
    color: '#4b5563'
  },
  saveBtn: {
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    padding: '10px 28px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  },
  tabContainer: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  tabNav: {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
    overflowX: 'auto'
  },
  tabBtn: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  tabBtnActive: {
    color: '#7c3aed',
    borderBottomColor: '#7c3aed',
    fontWeight: 600
  },
  tabContent: {
    padding: 24
  },
  subGroupTitle: {
    fontSize: 17,
    fontWeight: 600,
    marginTop: 24,
    marginBottom: 8,
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8
  },
  subGroupBox: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    background: '#fafafa'
  }
};

export default SystemFlags;
