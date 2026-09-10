import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';

export interface Country {
  code: string;
  name: string;
  dial: string;
  flagEmoji: string;
  placeholder: string;
  pattern: string;
  maxLength: number;
  errorMessage: string;
}

export const COUNTRIES: Country[] = [
  {
    code: 'PK',
    name: 'Pakistan',
    dial: '+92',
    flagEmoji: '🇵🇰',
    placeholder: '300 1234567 or 21 34567890',
    pattern: '^[2-9]\\d{1,3}[- ]?\\d{6,8}$',
    maxLength: 13,
    errorMessage: 'Enter a valid Pakistani mobile (e.g. 300 1234567) or landline (e.g. 21 34567890)'
  },
  {
    code: 'US',
    name: 'United States',
    dial: '+1',
    flagEmoji: '🇺🇸',
    placeholder: '(555) 000-0000',
    pattern: '^(\\([2-9]\\d{2}\\)|[2-9]\\d{2})[-. ]?\\d{3}[-. ]?\\d{4}$',
    maxLength: 14,
    errorMessage: 'Must be a valid 10-digit US phone number (e.g. (555) 000-0000)'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dial: '+44',
    flagEmoji: '🇬🇧',
    placeholder: '7911 123456',
    pattern: '^0?7\\d{3}[- ]?\\d{6}$',
    maxLength: 13,
    errorMessage: 'Must be a valid UK phone number (e.g. 7911 123456)'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dial: '+971',
    flagEmoji: '🇦🇪',
    placeholder: '50 123 4567',
    pattern: '^0?5\\d[- ]?\\d{7}$',
    maxLength: 12,
    errorMessage: 'Must be a valid UAE phone number (e.g. 50 123 4567)'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dial: '+966',
    flagEmoji: '🇸🇦',
    placeholder: '50 123 4567',
    pattern: '^0?5\\d[- ]?\\d{7}$',
    maxLength: 12,
    errorMessage: 'Must be a valid Saudi phone number (e.g. 50 123 4567)'
  },
  {
    code: 'CA',
    name: 'Canada',
    dial: '+1',
    flagEmoji: '🇨🇦',
    placeholder: '(555) 000-0000',
    pattern: '^(\\([2-9]\\d{2}\\)|[2-9]\\d{2})[-. ]?\\d{3}[-. ]?\\d{4}$',
    maxLength: 14,
    errorMessage: 'Must be a valid 10-digit Canadian phone number'
  },
  {
    code: 'AU',
    name: 'Australia',
    dial: '+61',
    flagEmoji: '🇦🇺',
    placeholder: '412 345 678',
    pattern: '^0?4\\d{2}[- ]?\\d{3}[- ]?\\d{3}$',
    maxLength: 12,
    errorMessage: 'Must be a valid Australian mobile number'
  },
  {
    code: 'DE',
    name: 'Germany',
    dial: '+49',
    flagEmoji: '🇩🇪',
    placeholder: '151 2345678',
    pattern: '^[1-9]\\d{1,4}[- ]?\\d{4,9}$',
    maxLength: 15,
    errorMessage: 'Must be a valid German phone number'
  },
  {
    code: 'FR',
    name: 'France',
    dial: '+33',
    flagEmoji: '🇫🇷',
    placeholder: '6 12 34 56 78',
    pattern: '^0?[67][- ]?\\d{2}[- ]?\\d{2}[- ]?\\d{2}[- ]?\\d{2}$',
    maxLength: 14,
    errorMessage: 'Must be a valid French phone number'
  },
  {
    code: 'QA',
    name: 'Qatar',
    dial: '+974',
    flagEmoji: '🇶🇦',
    placeholder: '3312 3456',
    pattern: '^[3567]\\d{7}$',
    maxLength: 10,
    errorMessage: 'Must be an 8-digit Qatar phone number'
  },
  {
    code: 'OM',
    name: 'Oman',
    dial: '+968',
    flagEmoji: '🇴🇲',
    placeholder: '9123 4567',
    pattern: '^[79]\\d{7}$',
    maxLength: 10,
    errorMessage: 'Must be an 8-digit Oman phone number'
  },
  {
    code: 'KW',
    name: 'Kuwait',
    dial: '+965',
    flagEmoji: '🇰🇼',
    placeholder: '5123 4567',
    pattern: '^[569]\\d{7}$',
    maxLength: 10,
    errorMessage: 'Must be an 8-digit Kuwait phone number'
  },
  {
    code: 'BH',
    name: 'Bahrain',
    dial: '+973',
    flagEmoji: '🇧🇭',
    placeholder: '3612 3456',
    pattern: '^[36]\\d{7}$',
    maxLength: 10,
    errorMessage: 'Must be an 8-digit Bahrain phone number'
  },
  {
    code: 'SG',
    name: 'Singapore',
    dial: '+65',
    flagEmoji: '🇸🇬',
    placeholder: '8123 4567',
    pattern: '^[89]\\d{7}$',
    maxLength: 10,
    errorMessage: 'Must be an 8-digit Singapore mobile number'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    dial: '+60',
    flagEmoji: '🇲🇾',
    placeholder: '12 345 6789',
    pattern: '^0?1\\d[- ]?\\d{7,8}$',
    maxLength: 12,
    errorMessage: 'Must be a valid Malaysian mobile number'
  },
  {
    code: 'TR',
    name: 'Turkey',
    dial: '+90',
    flagEmoji: '🇹🇷',
    placeholder: '532 123 4567',
    pattern: '^0?5\\d{2}[- ]?\\d{3}[- ]?\\d{4}$',
    maxLength: 13,
    errorMessage: 'Must be a valid Turkish mobile number'
  },
  {
    code: 'IN',
    name: 'India',
    dial: '+91',
    flagEmoji: '🇮🇳',
    placeholder: '98765 43210',
    pattern: '^[6-9]\\d{4}[- ]?\\d{5}$',
    maxLength: 12,
    errorMessage: 'Must be a valid 10-digit Indian mobile number'
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dial: '+880',
    flagEmoji: '🇧🇩',
    placeholder: '1712 345678',
    pattern: '^0?1[3-9]\\d{8}$',
    maxLength: 12,
    errorMessage: 'Must be a valid Bangladeshi mobile number'
  },
  {
    code: 'CN',
    name: 'China',
    dial: '+86',
    flagEmoji: '🇨🇳',
    placeholder: '138 0013 8000',
    pattern: '^1[3-9]\\d{9}$',
    maxLength: 13,
    errorMessage: 'Must be an 11-digit Chinese mobile number'
  },
  {
    code: 'JP',
    name: 'Japan',
    dial: '+81',
    flagEmoji: '🇯🇵',
    placeholder: '90 1234 5678',
    pattern: '^0?[789]0[- ]?\\d{4}[- ]?\\d{4}$',
    maxLength: 13,
    errorMessage: 'Must be a valid Japanese mobile number'
  },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // Pakistan

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  allowMultiple?: boolean;
  maxNumbers?: number;
}

export function parsePhoneValue(val: string): { code: string; national: string } {
  if (!val) return { code: 'PK', national: '' };
  const trimmed = val.trim();

  // Match longest dial code first
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dial)) {
      const rest = trimmed.substring(c.dial.length).trim();
      return { code: c.code, national: rest };
    }
  }

  // If Pakistani prefix without + (03... or 92... or 021...)
  if (trimmed.startsWith('0') || trimmed.startsWith('92')) {
    const clean = trimmed.startsWith('92') ? trimmed.substring(2) : trimmed;
    const normalized = clean.startsWith('0') ? clean.substring(1) : clean;
    return { code: 'PK', national: normalized.trim() };
  }

  return { code: 'PK', national: trimmed };
}

export function formatFullPhone(dial: string, national: string): string {
  const clean = national.trim();
  if (!clean) return '';

  const stripped = clean.startsWith('0') ? clean.substring(1) : clean;
  if (stripped.startsWith(dial)) {
    return stripped;
  }

  return `${dial} ${stripped}`;
}

interface SinglePhoneState {
  id: string;
  code: string;
  national: string;
  blurred: boolean;
}

function parseMultipleValue(val: string): SinglePhoneState[] {
  if (!val || !val.trim()) {
    return [{ id: '1', code: 'PK', national: '', blurred: false }];
  }
  const parts = val.split(/[,/]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [{ id: '1', code: 'PK', national: '', blurred: false }];
  }
  return parts.map((part, idx) => {
    const parsed = parsePhoneValue(part);
    return {
      id: String(idx + 1),
      code: parsed.code,
      national: parsed.national,
      blurred: false,
    };
  });
}

export default function PhoneInput({
  value,
  onChange,
  id,
  name,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  allowMultiple = false,
  maxNumbers = 3,
}: PhoneInputProps) {
  const [entries, setEntries] = useState<SinglePhoneState[]>(() => parseMultipleValue(value));
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync external value updates (e.g. initial form load, resets)
  useEffect(() => {
    const currentCombined = entries
      .map(e => {
        const country = COUNTRIES.find(c => c.code === e.code) || DEFAULT_COUNTRY;
        return formatFullPhone(country.dial, e.national);
      })
      .filter(Boolean)
      .join(', ');

    if ((value || '').trim() !== currentCombined.trim()) {
      setEntries(parseMultipleValue(value));
    }
  }, [value]);

  // Handle outside click & Escape key for country dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveDropdownId(null);
      }
    }

    if (activeDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdownId]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dial.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Notify parent on change
  const notifyChange = (updatedEntries: SinglePhoneState[]) => {
    const combined = updatedEntries
      .map(e => {
        const country = COUNTRIES.find(c => c.code === e.code) || DEFAULT_COUNTRY;
        return formatFullPhone(country.dial, e.national);
      })
      .filter(Boolean)
      .join(', ');

    onChange(combined);
  };

  const handleCountrySelect = (entryId: string, country: Country) => {
    setActiveDropdownId(null);
    setSearch('');

    const updated = entries.map(e => (e.id === entryId ? { ...e, code: country.code } : e));
    setEntries(updated);
    notifyChange(updated);
  };

  const handleNumberChange = (entryId: string, inputVal: string) => {
    const entry = entries.find(e => e.id === entryId);
    const country = COUNTRIES.find(c => c.code === (entry?.code || 'PK')) || DEFAULT_COUNTRY;

    let val = inputVal;

    // Detect pasted full international number with '+'
    if (val.startsWith('+')) {
      const parsed = parsePhoneValue(val);
      const updated = entries.map(e =>
        e.id === entryId ? { ...e, code: parsed.code, national: parsed.national } : e
      );
      setEntries(updated);
      notifyChange(updated);
      return;
    }

    // Auto-strip leading 0 in Pakistan
    if (country.code === 'PK' && val.startsWith('0')) {
      val = val.replace(/^0+/, '');
    }

    // Auto-format Pakistan numbers
    if (country.code === 'PK') {
      const d = val.replace(/\D/g, '');
      if (d.startsWith('3') && d.length > 3 && !val.includes('-') && !val.includes(' ')) {
        val = `${d.slice(0, 3)} ${d.slice(3, 10)}`;
      } else if (
        ['21', '42', '51', '22', '41', '52', '55', '61', '81', '91'].some(c => d.startsWith(c)) &&
        d.length > 2 &&
        !val.includes('-') &&
        !val.includes(' ')
      ) {
        val = `${d.slice(0, 2)} ${d.slice(2, 10)}`;
      }
    }

    const updated = entries.map(e => (e.id === entryId ? { ...e, national: val } : e));
    setEntries(updated);
    notifyChange(updated);
  };

  const handleBlur = (entryId: string) => {
    setEntries(prev => prev.map(e => (e.id === entryId ? { ...e, blurred: true } : e)));
  };

  const addNumber = () => {
    if (entries.length >= maxNumbers) return;
    const newEntry: SinglePhoneState = {
      id: String(Date.now()),
      code: 'PK',
      national: '',
      blurred: false,
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    notifyChange(updated);
  };

  const removeNumber = (entryId: string) => {
    if (entries.length <= 1) {
      // Clear single remaining
      const reset = [{ id: '1', code: 'PK', national: '', blurred: false }];
      setEntries(reset);
      notifyChange(reset);
      return;
    }
    const updated = entries.filter(e => e.id !== entryId);
    setEntries(updated);
    notifyChange(updated);
  };

  return (
    <div ref={containerRef} className={`space-y-2 ${className}`}>
      {entries.map((entry, idx) => {
        const country = COUNTRIES.find(c => c.code === entry.code) || DEFAULT_COUNTRY;
        const digitsOnly = entry.national.replace(/\D/g, '');

        const isPrefixValid = !digitsOnly || (country.code === 'PK'
          ? ['2', '3', '4', '5', '6', '7', '8', '9'].includes(digitsOnly[0])
          : true);

        const isComplete = !digitsOnly || (country.code === 'PK'
          ? digitsOnly.length >= 9 && digitsOnly.length <= 10
          : digitsOnly.length >= 7);

        let error: string | null = null;
        if (digitsOnly && !isPrefixValid) {
          error = country.code === 'PK'
            ? 'Must start with a valid mobile (3XX) or area code (2-9)'
            : country.errorMessage;
        } else if (entry.blurred && digitsOnly && !isComplete) {
          error = country.code === 'PK'
            ? 'Please enter 9 or 10 digits (e.g. 300 1234567 or 21 34567890)'
            : country.errorMessage;
        }

        const isDropdownOpen = activeDropdownId === entry.id;

        return (
          <div key={entry.id} className="relative">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex-1 flex items-stretch rounded-lg border bg-white transition-all overflow-hidden ${
                  error
                    ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent'
                    : 'border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent'
                } ${disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
              >
                {/* Country Trigger */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      setActiveDropdownId(isDropdownOpen ? null : entry.id);
                      setSearch('');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50/90 hover:bg-gray-100 border-r border-gray-200 text-gray-800 text-sm font-medium transition-colors select-none shrink-0"
                  title={`${country.name} (${country.dial}) - Click to change`}
                >
                  <img
                    src={`https://flagcdn.com/w24/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    className="w-4 h-3 object-cover rounded-xs shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-gray-700 text-xs sm:text-sm">{country.dial}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Input */}
                <input
                  type="tel"
                  id={idx === 0 ? id : undefined}
                  name={idx === 0 ? name : undefined}
                  value={entry.national}
                  onChange={e => handleNumberChange(entry.id, e.target.value)}
                  onBlur={() => handleBlur(entry.id)}
                  placeholder={
                    placeholder ||
                    (idx === 0
                      ? country.placeholder
                      : `Alternate phone (e.g. ${country.placeholder})`)
                  }
                  disabled={disabled}
                  required={required && idx === 0}
                  maxLength={country.maxLength}
                  pattern={country.pattern}
                  title={country.errorMessage}
                  className="flex-1 w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Remove button (when multiple entries exist) */}
              {allowMultiple && entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNumber(entry.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                  title="Remove this phone number"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium animate-in fade-in duration-150">
                <AlertCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Country Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute z-50 left-0 top-full mt-1.5 w-72 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 divide-y divide-gray-50 pr-1">
                  {filteredCountries.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">No matching country found</div>
                  ) : (
                    filteredCountries.map(c => {
                      const isSelected = c.code === country.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleCountrySelect(entry.id, c)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <img
                              src={`https://flagcdn.com/w24/${c.code.toLowerCase()}.png`}
                              alt={c.name}
                              className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="truncate">{c.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-gray-400 font-mono text-[11px]">{c.dial}</span>
                            {isSelected && <Check size={13} className="text-primary" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Alternate Phone Button */}
      {allowMultiple && entries.length < maxNumbers && (
        <button
          type="button"
          onClick={addNumber}
          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-dark transition-colors py-1 px-1"
        >
          <Plus size={14} />
          <span>Add alternate phone number</span>
        </button>
      )}
    </div>
  );
}
