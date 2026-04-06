import React, { useState, useEffect, useCallback } from 'react';
import { systemFlagApi } from '../api/services';
import Loader from '../components/Loader';
import { Settings } from 'lucide-react';
import '../styles/SystemFlags.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SystemFlags = () => {
  const [flagGroups, setFlagGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flaggroupStates, setFlaggroupStates] = useState({});
  const [openMultiSelect, setOpenMultiSelect] = useState(null);
  const [videoToggles, setVideoToggles] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemFlagApi.getAll();
      const data = res.data.data || res.data;
      const groups = data.flagGroup || [];
      setFlagGroups(groups);
      setLanguages(data.language || []);
      const states = {};
      groups.forEach(g => { if (g.subGroup) g.subGroup.forEach(sg => { states[sg.id] = { id: sg.id, isActive: sg.isActive ? 1 : 0 }; }); });
      setFlaggroupStates(states);
      const vt = {};
      groups.forEach(g => { if (g.systemFlag) g.systemFlag.forEach(sf => { if (sf.valueType === 'Video') vt[sf.name] = !!sf.value; }); });
      setVideoToggles(vt);
    } catch (err) { console.error('Error fetching system flags:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFlagValue = (groupIndex, flagIndex, value, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    if (isSubGroup && subGroupIndex !== null) { updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex].value = value; }
    else { updated[groupIndex].systemFlag[flagIndex].value = value; }
    setFlagGroups(updated);
  };

  const handleFileChange = (e, groupIndex, flagIndex, isSubGroup = false, subGroupIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { updateFlagValue(groupIndex, flagIndex, reader.result, isSubGroup, subGroupIndex); };
    reader.readAsDataURL(file);
  };

  const toggleMultiSelect = (groupIndex, flagIndex, langId, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    let flag = isSubGroup && subGroupIndex !== null ? updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex] : updated[groupIndex].systemFlag[flagIndex];
    const currentValues = flag.value ? flag.value.split(',').filter(v => v) : [];
    const strId = String(langId);
    flag.value = currentValues.includes(strId) ? currentValues.filter(v => v !== strId).join(',') : [...currentValues, strId].join(',');
    setFlagGroups(updated);
  };

  const toggleWebLangSelect = (groupIndex, flagIndex, langCode, isSubGroup = false, subGroupIndex = null) => {
    const updated = JSON.parse(JSON.stringify(flagGroups));
    let flag = isSubGroup && subGroupIndex !== null ? updated[groupIndex].subGroup[subGroupIndex].systemFlag[flagIndex] : updated[groupIndex].systemFlag[flagIndex];
    let currentValues = []; try { currentValues = JSON.parse(flag.value || '[]'); } catch { currentValues = []; }
    if (!Array.isArray(currentValues)) currentValues = [];
    flag.value = currentValues.includes(langCode) ? JSON.stringify(currentValues.filter(v => v !== langCode)) : JSON.stringify([...currentValues, langCode]);
    setFlagGroups(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const group = flagGroups.map((g) => {
        const groupData = { systemFlag: [], subGroup: [] };
        if (g.systemFlag?.length > 0) {
          groupData.systemFlag = g.systemFlag.map(sf => {
            let val = sf.value;
            if (sf.valueType === 'MultiSelect') val = sf.value ? sf.value.split(',').filter(v => v) : [];
            if (sf.valueType === 'MultiSelectWebLang') { try { val = JSON.parse(sf.value || '[]'); } catch { val = []; } }
            return { name: sf.name, value: val, valueType: sf.valueType };
          });
        }
        if (g.subGroup?.length > 0) {
          groupData.subGroup = g.subGroup.map(sg => ({
            systemFlag: sg.systemFlag ? sg.systemFlag.map(sf => {
              let val = sf.value;
              if (sf.valueType === 'MultiSelect') val = sf.value ? sf.value.split(',').filter(v => v) : [];
              if (sf.valueType === 'MultiSelectWebLang') { try { val = JSON.parse(sf.value || '[]'); } catch { val = []; } }
              return { name: sf.name, value: val, valueType: sf.valueType };
            }) : []
          }));
        }
        return groupData;
      });
      await systemFlagApi.edit({ group, flaggroups: flaggroupStates });
      alert('Settings saved successfully!');
      fetchData();
    } catch (err) { console.error('Error saving:', err); alert('Failed to save settings'); }
    setSaving(false);
  };

  const getRadioOptions = (flagName) => {
    const yesNoFlags = ['FirstFreeChat', 'FirstFreeChatRecharge', 'AiAstrologer', 'Callsection', 'Chatsection', 'Livesection'];
    if (yesNoFlags.includes(flagName)) return [{ label: 'Yes', val: '1' }, { label: 'No', val: '0' }];
    if (flagName === 'PaymentMode') return [{ label: 'Razor Pay', val: 'RazorPay' }, { label: 'Stripe', val: 'Stripe' }];
    if (flagName === 'storege_provider') return [{ label: 'Google Bucket', val: 'google_bucket' }, { label: 'AWS Bucket', val: 'aws_bucket' }, { label: 'Digital Ocean', val: 'digital_ocean' }, { label: 'Local Storage', val: 'local' }];
    if (flagName === 'streaming_provider') return [{ label: 'Agora', val: 'agora' }, { label: 'Zegocloud', val: 'zego' }, { label: '100ms', val: 'hms' }];
    if (flagName === 'geocode_provider') return [{ label: 'Photon (Free)', val: 'photon' }, { label: 'Google Maps', val: 'google' }, { label: 'OpenStreetMap', val: 'osm' }];
    return [{ label: 'Yes', val: '1' }, { label: 'No', val: '0' }];
  };

  const shouldShowEnableDisable = (subGroup) => subGroup.parentFlagGroupId === 2 || subGroup.id === 7 || subGroup.id === 65 || subGroup.id === 66;

  const isSubGroupVisible = (subGroup) => {
    const name = subGroup.flagGroupName ? subGroup.flagGroupName.toLowerCase() : '';
    let storageProvider = '';
    for (const g of flagGroups) { if (g.subGroup) for (const sg of g.subGroup) { if (sg.systemFlag) for (const sf of sg.systemFlag) { if (sf.name === 'storege_provider') storageProvider = sf.value || ''; } } }
    if (storageProvider && ['google_bucket', 'aws_bucket', 'digital_ocean', 'local'].includes(name)) return name === storageProvider;
    return true;
  };

  const renderFlag = (flag, groupIndex, flagIndex, isSubGroup = false, subGroupIndex = null) => {
    const { valueType, displayName, description, name, value } = flag;
    if (name === 'appDesignId') return null;

    if (valueType === 'Text' || valueType === 'Number') {
      return (
        <div key={`${name}-${flagIndex}`} className="sf-field">
          <label className="sf-label">{displayName}{description && <span className="sf-tooltip" title={description}> &#9432;</span>}</label>
          <input type={valueType === 'Number' ? 'number' : 'text'} value={value || ''} onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)}
            onKeyPress={valueType === 'Text' ? e => { if (e.key === '<' || e.key === '>') e.preventDefault(); } : undefined} className="sf-input" />
        </div>
      );
    }

    if (valueType === 'Radio') {
      const options = getRadioOptions(name);
      return (
        <div key={`${name}-${flagIndex}`} className="sf-field">
          <label className="sf-label">{displayName}{description && <span className="sf-tooltip" title={description}> &#9432;</span>}</label>
          <div className="sf-radio-group">
            {options.map(opt => (
              <label key={opt.val} className={`sf-radio-label ${String(value) === String(opt.val) ? 'selected' : ''}`}>
                <input type="radio" checked={String(value) === String(opt.val)} onChange={() => updateFlagValue(groupIndex, flagIndex, opt.val, isSubGroup, subGroupIndex)} />
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
        <div key={`${name}-${flagIndex}`} className="sf-file-card">
          <div className="sf-file-preview">
            {imgSrc ? <img src={imgSrc} alt={displayName} /> : <div className="sf-file-empty">No Image</div>}
          </div>
          <div className="sf-file-info">
            <label className="sf-file-name">{displayName}</label>
            <label className="sf-file-upload-btn">
              Choose File
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, groupIndex, flagIndex, isSubGroup, subGroupIndex)} hidden />
            </label>
          </div>
        </div>
      );
    }

    if (valueType === 'MultiSelect') {
      const msKey = `${name}-${flagIndex}`;
      const selectedIds = value ? value.split(',').filter(v => v) : [];
      const isOpen = openMultiSelect === msKey;
      const unselected = languages.filter(l => !selectedIds.includes(String(l.id)));
      return (
        <div key={msKey} className="sf-field">
          <label className="sf-label">{displayName}{description && <span className="sf-tooltip" title={description}> &#9432;</span>}</label>
          <div className="sf-multi-container" onClick={() => !isOpen && setOpenMultiSelect(msKey)}>
            <div className="sf-tags">
              {selectedIds.map(id => { const lang = languages.find(l => String(l.id) === id); return lang ? (
                <span key={id} className="sf-tag">{lang.languageName}<span className="sf-tag-remove" onClick={e => { e.stopPropagation(); toggleMultiSelect(groupIndex, flagIndex, id, isSubGroup, subGroupIndex); }}>&times;</span></span>
              ) : null; })}
              {selectedIds.length === 0 && <span className="sf-multi-placeholder">Click to select...</span>}
            </div>
            {isOpen && unselected.length > 0 && (
              <div className="sf-dropdown">
                {unselected.map(lang => (
                  <button key={lang.id} type="button" onClick={e => { e.stopPropagation(); toggleMultiSelect(groupIndex, flagIndex, lang.id, isSubGroup, subGroupIndex); }} className="sf-dropdown-item">+ {lang.languageName}</button>
                ))}
                <button type="button" onClick={e => { e.stopPropagation(); setOpenMultiSelect(null); }} className="sf-dropdown-close">Done</button>
              </div>
            )}
            {!isOpen && selectedIds.length > 0 && <span className="sf-multi-toggle" onClick={() => setOpenMultiSelect(msKey)}>+ Add more</span>}
          </div>
        </div>
      );
    }

    if (valueType === 'MultiSelectWebLang') {
      const wlKey = `wl-${name}-${flagIndex}`;
      let selectedCodes = []; try { selectedCodes = JSON.parse(value || '[]'); } catch { selectedCodes = []; }
      if (!Array.isArray(selectedCodes)) selectedCodes = [];
      const isOpen = openMultiSelect === wlKey;
      const unselected = languages.filter(l => l.languageCode && !selectedCodes.includes(l.languageCode));
      return (
        <div key={wlKey} className="sf-field">
          <label className="sf-label">{displayName}{description && <span className="sf-tooltip" title={description}> &#9432;</span>}</label>
          <div className="sf-multi-container" onClick={() => !isOpen && setOpenMultiSelect(wlKey)}>
            <div className="sf-tags">
              {selectedCodes.map(code => { const lang = languages.find(l => l.languageCode === code); return (
                <span key={code} className="sf-tag">{lang ? lang.languageName : code}<span className="sf-tag-remove" onClick={e => { e.stopPropagation(); toggleWebLangSelect(groupIndex, flagIndex, code, isSubGroup, subGroupIndex); }}>&times;</span></span>
              ); })}
              {selectedCodes.length === 0 && <span className="sf-multi-placeholder">Click to select...</span>}
            </div>
            {isOpen && unselected.length > 0 && (
              <div className="sf-dropdown">
                {unselected.map(lang => (
                  <button key={lang.languageCode} type="button" onClick={e => { e.stopPropagation(); toggleWebLangSelect(groupIndex, flagIndex, lang.languageCode, isSubGroup, subGroupIndex); }} className="sf-dropdown-item">+ {lang.languageName}</button>
                ))}
                <button type="button" onClick={e => { e.stopPropagation(); setOpenMultiSelect(null); }} className="sf-dropdown-close">Done</button>
              </div>
            )}
            {!isOpen && selectedCodes.length > 0 && <span className="sf-multi-toggle" onClick={() => setOpenMultiSelect(wlKey)}>+ Add more</span>}
          </div>
        </div>
      );
    }

    if (valueType === 'SelectWalletType') {
      return (
        <div key={`${name}-${flagIndex}`} className="sf-field">
          <label className="sf-label">{displayName}{description && <span className="sf-tooltip" title={description}> &#9432;</span>}</label>
          <select value={value || ''} onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)} className="sf-input" disabled={!!value} style={value ? { cursor: 'not-allowed', background: '#f1f5f9' } : {}}>
            <option value="">Choose Wallet</option><option value="Wallet">Wallet</option><option value="Coin">Coin</option>
          </select>
        </div>
      );
    }

    if (valueType === 'Video') {
      const isEnabled = videoToggles[name] !== undefined ? videoToggles[name] : !!value;
      const videoSrc = value && value.includes('data:') ? value : (value ? `${API_BASE}/${value}` : '');
      return (
        <div key={`${name}-${flagIndex}`} className="sf-field">
          <label className="sf-label">{displayName}</label>
          <div className="sf-radio-group" style={{ marginBottom: 8 }}>
            <label className={`sf-radio-label ${isEnabled ? 'selected' : ''}`}>
              <input type="radio" checked={isEnabled} onChange={() => setVideoToggles(prev => ({ ...prev, [name]: true }))} /> Enable
            </label>
            <label className={`sf-radio-label ${!isEnabled ? 'selected' : ''}`}>
              <input type="radio" checked={!isEnabled} onChange={() => { setVideoToggles(prev => ({ ...prev, [name]: false })); updateFlagValue(groupIndex, flagIndex, '', isSubGroup, subGroupIndex); }} /> Disable
            </label>
          </div>
          {isEnabled && (
            <div>
              {videoSrc && <div className="sf-video-preview"><video controls preload="metadata"><source type="video/mp4" src={videoSrc} /></video></div>}
              <input type="file" accept="video/mp4" onChange={e => handleFileChange(e, groupIndex, flagIndex, isSubGroup, subGroupIndex)} style={{ fontSize: 12 }} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={`${name}-${flagIndex}`} className="sf-field">
        <label className="sf-label">{displayName || name}</label>
        <input type="text" value={value || ''} onChange={e => updateFlagValue(groupIndex, flagIndex, e.target.value, isSubGroup, subGroupIndex)} className="sf-input" />
      </div>
    );
  };

  if (loading) return <Loader text="Loading settings..." />;

  return (
    <div className="sf-page">
      <div className="sf-header">
        <div className="sf-header-left">
          <Settings size={25} color="#7c3aed" />
          <h2 className="sf-title">Settings</h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="sf-save-btn">{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>

      <div className="sf-container">
        <div className="sf-tabs">
          {flagGroups.map((group, index) => (
            <button key={group.id || index} onClick={() => setActiveTab(index)} className={`sf-tab ${activeTab === index ? 'active' : ''}`}>
              {group.flagGroupName}
            </button>
          ))}
        </div>

        <div className="sf-content">
          {flagGroups.map((group, groupIndex) => (
            <div key={group.id || groupIndex} style={{ display: activeTab === groupIndex ? 'block' : 'none' }}>
              {group.systemFlag?.length > 0 && (
                group.systemFlag.some(f => f.valueType === 'File') && group.systemFlag.every(f => f.valueType === 'File' || f.name === 'appDesignId')
                  ? <div className="sf-file-grid">{group.systemFlag.map((flag, flagIndex) => renderFlag(flag, groupIndex, flagIndex))}</div>
                  : <div>{group.systemFlag.map((flag, flagIndex) => renderFlag(flag, groupIndex, flagIndex))}</div>
              )}

              {group.subGroup?.length > 0 && group.subGroup.map((subGroup, subGroupIndex) => {
                const visible = isSubGroupVisible(subGroup);
                return (
                  <div key={subGroup.id || subGroupIndex} style={{ display: visible ? 'block' : 'none' }}>
                    <h4 className="sf-subgroup-title">
                      {subGroup.flagGroupName}
                      {subGroup.description && <span className="sf-tooltip" title={subGroup.description}> &#9432;</span>}
                    </h4>

                    {shouldShowEnableDisable(subGroup) && (
                      <div className="sf-enable-toggle">
                        <label className={`sf-radio-label ${flaggroupStates[subGroup.id]?.isActive === 1 ? 'selected' : ''}`}>
                          <input type="radio" checked={flaggroupStates[subGroup.id]?.isActive === 1}
                            onChange={() => setFlaggroupStates(prev => ({ ...prev, [subGroup.id]: { ...prev[subGroup.id], isActive: 1 } }))} /> Enable
                        </label>
                        <label className={`sf-radio-label ${flaggroupStates[subGroup.id]?.isActive === 0 ? 'selected' : ''}`}>
                          <input type="radio" checked={flaggroupStates[subGroup.id]?.isActive === 0}
                            onChange={() => setFlaggroupStates(prev => ({ ...prev, [subGroup.id]: { ...prev[subGroup.id], isActive: 0 } }))} /> Disable
                        </label>
                      </div>
                    )}

                    <div className="sf-subgroup-box">
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

export default SystemFlags;
