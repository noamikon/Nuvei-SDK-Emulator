
"use client";

import React, { useState, useEffect, useRef } from "react";

// --- Theme Definitions ---

type Theme = {
  name: string;
  background: string;
  text: string;
  border: string;
  json: {
    string: string;
    number: string;
    boolean: string;
    null: string;
    key: string;
    bracket: string;
    interactive: string;
  };
};

const THEMES: Record<string, Theme> = {
  default: {
    name: "Default",
    background: "var(--bg-default)", // Dynamic based on night mode
    text: "var(--text-default)",
    border: "", // Dynamic fallback
    json: {
      string: "#34d399",
      number: "#60a5fa",
      boolean: "#a78bfa",
      null: "#6b7280",
      key: "#f59e0b",
      bracket: "var(--text-dim)",
      interactive: "#8b5cf6"
    }
  },
  monokai: {
    name: "Monokai",
    background: "#272822",
    text: "#f8f8f2",
    border: "#49483e",
    json: {
      string: "#e6db74",
      number: "#ae81ff",
      boolean: "#ae81ff",
      null: "#75715e",
      key: "#f92672",
      bracket: "#f8f8f2",
      interactive: "#66d9ef"
    }
  },
  githubLight: {
    name: "GitHub Light",
    background: "#ffffff",
    text: "#24292e",
    border: "#e1e4e8",
    json: {
      string: "#032f62",
      number: "#005cc5",
      boolean: "#005cc5",
      null: "#6a737d",
      key: "#22863a",
      bracket: "#24292e",
      interactive: "#0366d6"
    }
  },
  githubDark: {
    name: "GitHub Dark",
    background: "#0d1117",
    text: "#c9d1d9",
    border: "#30363d",
    json: {
      string: "#a5d6ff",
      number: "#79c0ff",
      boolean: "#79c0ff",
      null: "#8b949e",
      key: "#7ee787",
      bracket: "#c9d1d9",
      interactive: "#58a6ff"
    }
  },
  solarizedLight: {
    name: "Solarized Light",
    background: "#fdf6e3",
    text: "#657b83",
    border: "#93a1a1",
    json: {
      string: "#2aa198",
      number: "#d33682",
      boolean: "#d33682",
      null: "#93a1a1",
      key: "#859900",
      bracket: "#657b83",
      interactive: "#268bd2"
    }
  },
  solarizedDark: {
    name: "Solarized Dark",
    background: "#002b36",
    text: "#839496",
    border: "#586e75",
    json: {
      string: "#2aa198",
      number: "#d33682",
      boolean: "#d33682",
      null: "#586e75",
      key: "#859900",
      bracket: "#839496",
      interactive: "#268bd2"
    }
  }
};

function ThemeSelector({
  currentTheme,
  onThemeChange,
  nightMode
}: {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  nightMode: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={currentTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        style={{
          appearance: 'none',
          backgroundColor: nightMode ? '#333' : '#f0f0f0',
          color: nightMode ? '#fff' : '#333',
          border: `1px solid ${nightMode ? '#555' : '#ccc'} `,
          borderRadius: '4px',
          padding: '4px 24px 4px 8px',
          fontSize: '0.75rem',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 500
        }}
      >
        {Object.entries(THEMES).map(([key, theme]) => (
          <option key={key} value={key}>
            {theme.name}
          </option>
        ))}
      </select>
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontSize: '0.6rem',
        color: nightMode ? '#aaa' : '#666'
      }}>
        ▼
      </div>
    </div>
  );
}

// Collapsible JSON viewer component
function CollapsibleJson({
  data,
  nightMode,
  themeName = 'default',
  indent = 0
}: {
  data: any;
  nightMode: boolean;
  themeName?: string;
  indent?: number;
}) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Resolve theme
  const theme = THEMES[themeName] || THEMES.default;

  // Helper to resolve dynamic variables for default theme
  const getColor = (colorKey: keyof typeof theme.json) => {
    if (themeName !== 'default') return theme.json[colorKey];

    // Dynamic overrides for default theme based on nightMode
    if (colorKey === 'bracket') return nightMode ? '#888' : '#999';
    return theme.json[colorKey];
  };

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderValue = (value: any, key: string, path: string): React.ReactNode => {
    const indentPx = indent * 20;

    if (value === null) {
      return <span style={{ color: getColor('null') }}>null</span>;
    }

    if (typeof value === 'boolean') {
      return <span style={{ color: getColor('boolean') }}>{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span style={{ color: getColor('number') }}>{value}</span>;
    }

    if (typeof value === 'string') {
      return <span style={{ color: getColor('string') }}>"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      const shouldCollapse = value.length > 3;

      if (shouldCollapse && !isExpanded) {
        return (
          <span>
            <span style={{ color: getColor('bracket') }}>[</span>
            <span
              onClick={() => togglePath(path)}
              style={{
                color: getColor('interactive'),
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0 4px'
              }}
              title={`Click to expand ${value.length} items`}
            >
              ...
            </span>
            <span style={{ color: getColor('bracket') }}>{` // ${value.length} items`}</span>
            < span style={{ color: getColor('bracket') }}>]</span >
          </span >
        );
      }

      if (value.length === 0) {
        return <span style={{ color: getColor('bracket') }}>[]</span>;
      }

      return (
        <span>
          <span style={{ color: getColor('bracket') }}>[</span>
          {shouldCollapse && (
            <span
              onClick={() => togglePath(path)}
              style={{
                color: getColor('interactive'),
                cursor: 'pointer',
                fontSize: '0.75rem',
                marginLeft: '8px',
                textDecoration: 'underline'
              }}
              title="Click to collapse"
            >
              [collapse]
            </span>
          )}
          <div style={{ marginLeft: `${indentPx + 20}px` }}>
            {value.map((item, idx) => (
              <div key={idx}>
                <CollapsibleJson
                  data={item}
                  nightMode={nightMode}
                  themeName={themeName}
                  indent={indent + 1}
                />
                {idx < value.length - 1 && <span style={{ color: getColor('bracket') }}>,</span>}
              </div>
            ))}
          </div>
          <span style={{ color: getColor('bracket') }}>]</span>
        </span>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span style={{ color: getColor('bracket') }}>{'{}'}</span>;
      }

      return (
        <span>
          <span style={{ color: getColor('bracket') }}>{'{'}</span>
          <div style={{ marginLeft: `${indentPx + 20}px` }}>
            {keys.map((k, idx) => (
              <div key={k}>
                <span style={{ color: getColor('key') }}>"{k}"</span>
                <span style={{ color: getColor('bracket') }}>: </span>
                <CollapsibleJson
                  data={value[k]}
                  nightMode={nightMode}
                  themeName={themeName}
                  indent={indent + 1}
                />
                {idx < keys.length - 1 && <span style={{ color: getColor('bracket') }}>,</span>}
              </div>
            ))}
          </div>
          <span style={{ color: getColor('bracket') }}>{'}'}</span>
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  return <>{renderValue(data, '', `root-${indent}`)}</>;
}

type FlowName =
  | "creditCardDeposit"
  | "apmDeposit";

type SdkMethodName =
  | "getApms"
  | "getCardDetails"
  | "getUserUPOs"
  | "addApmUpo"
  | "addCardUpo";

interface FlowDefinition {
  id: FlowName;
  name: string;
  description: string;
  requiredFields: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
}

// Supported currencies from Nuvei documentation
// APM-specific currency support (based on Nuvei documentation)
const APM_CURRENCIES: Record<string, string[]> = {
  'apmgw_Neteller': ['AUD', 'BGN', 'CAD', 'DKK', 'EEK', 'EUR', 'GBP', 'HUF', 'INR', 'JPY', 'LTL', 'LVL', 'MXN', 'NOK', 'PLN', 'RON', 'RUB', 'SEK', 'USD'],
  'apmgw_Skrill': ['AED', 'AUD', 'BGN', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MAD', 'MYR', 'NOK', 'NZD', 'OMR', 'PLN', 'RON', 'RSD', 'SAR', 'SEK', 'SGD', 'THB', 'TND', 'TRY', 'TWD', 'USD', 'ZAR'],
  'apmgw_PayPal': ['AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'NOK', 'NZD', 'PHP', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'USD'],
  'apmgw_ecoPayz': ['AUD', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HUF', 'INR', 'NOK', 'PLN', 'SEK', 'USD', 'ZAR'],
  'apmgw_Paysafecard': ['ARS', 'AUD', 'BRL', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HRK', 'HUF', 'KWD', 'MXN', 'NOK', 'NZD', 'PEN', 'PLN', 'RON', 'SEK', 'TRY', 'USD', 'UYU'],
  'apmgw_Sofort': ['EUR', 'CHF', 'GBP', 'PLN', 'CZK'],
  'apmgw_iDEAL': ['EUR'],
  'apmgw_Giropay': ['EUR'],
  'apmgw_EPS': ['EUR'],
  'apmgw_Trustly': ['EUR', 'SEK', 'DKK', 'NOK', 'GBP', 'PLN'],
  'apmgw_Multibanco': ['EUR'],
  'apmgw_MyBank': ['EUR'],
  'apmgw_P24': ['EUR', 'GBP', 'CZK', 'PLN'],
  'apmgw_Bancontact': ['EUR'],
  'apmgw_InstantBank': ['EUR'],
  // Add more APMs as needed - this list can be expanded
};

const CURRENCIES = [
  { code: "AED", name: "UAE dirham" },
  { code: "ALL", name: "Albanian lek" },
  { code: "AMD", name: "Armenian dram" },
  { code: "ARS", name: "Argentine peso" },
  { code: "AUD", name: "Australian dollar" },
  { code: "AZN", name: "Azerbaijan manat" },
  { code: "BAM", name: "Bosnia and Herzegovina convertible mark" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "BGN", name: "Bulgarian lev" },
  { code: "BHD", name: "Bahraini dinar" },
  { code: "BMD", name: "Bermudian dollar" },
  { code: "BND", name: "Brunei dollar" },
  { code: "BRL", name: "Brazilian real" },
  { code: "BYN", name: "Belarusian ruble" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "CLP", name: "Chilean peso" },
  { code: "CNY", name: "Chinese Yuan Renminbi" },
  { code: "COP", name: "Colombian peso" },
  { code: "CRC", name: "Costa Rican colon" },
  { code: "CZK", name: "Czech koruna" },
  { code: "DKK", name: "Danish krone" },
  { code: "DOP", name: "Dominican peso" },
  { code: "DZD", name: "Algerian dinar" },
  { code: "EGP", name: "Egyptian pound" },
  { code: "EUR", name: "European euro" },
  { code: "GBP", name: "Pound sterling" },
  { code: "GEL", name: "Georgian lari" },
  { code: "GHS", name: "Ghanaian cedi" },
  { code: "GTQ", name: "Guatemalan quetzal" },
  { code: "HKD", name: "Hong Kong dollar" },
  { code: "HUF", name: "Hungarian forint" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "INR", name: "Indian rupee" },
  { code: "IQD", name: "Iraqi dinar" },
  { code: "ISK", name: "Icelandic krona" },
  { code: "JOD", name: "Jordanian dinar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KES", name: "Kenyan shilling" },
  { code: "KGS", name: "Kyrgyzstani som" },
  { code: "KHR", name: "Cambodian riel" },
  { code: "KMF", name: "Comorian franc" },
  { code: "KRW", name: "South Korean won" },
  { code: "KWD", name: "Kuwaiti dinar" },
  { code: "KZT", name: "Kazakhstani tenge" },
  { code: "LAK", name: "Lao kip" },
  { code: "LBP", name: "Lebanese pound" },
  { code: "LKR", name: "Sri Lankan rupee" },
  { code: "LYD", name: "Libyan dinar" },
  { code: "MAD", name: "Moroccan dirham" },
  { code: "MDL", name: "Moldovan leu" },
  { code: "MKD", name: "Macedonian denar" },
  { code: "MMK", name: "Myanmar kyat" },
  { code: "MNT", name: "Mongolian tugrik" },
  { code: "MUR", name: "Mauritian rupee" },
  { code: "MWK", name: "Malawian kwacha" },
  { code: "MXN", name: "Mexican peso" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "MZN", name: "Mozambican metical" },
  { code: "NAD", name: "Namibian dollar" },
  { code: "NGN", name: "Nigerian naira" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "OMR", name: "Omani rial" },
  { code: "PEN", name: "Peruvian sol" },
  { code: "PHP", name: "Philippine peso" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "PLN", name: "Polish zloty" },
  { code: "PYG", name: "Paraguayan guarani" },
  { code: "QAR", name: "Qatari riyal" },
  { code: "RON", name: "Romanian leu" },
  { code: "RSD", name: "Serbian dinar" },
  { code: "RUB", name: "Russian ruble" },
  { code: "SAR", name: "Saudi Arabian riyal" },
  { code: "SEK", name: "Swedish krona" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "SOS", name: "Somali shilling" },
  { code: "THB", name: "Thai baht" },
  { code: "TND", name: "Tunisian dinar" },
  { code: "TOP", name: "Tongan paʻanga" },
  { code: "TRY", name: "Turkish lira" },
  { code: "TTD", name: "Trinidad and Tobago dollar" },
  { code: "TWD", name: "New Taiwan dollar" },
  { code: "UAH", name: "Ukrainian hryvnia" },
  { code: "UGX", name: "Ugandan shilling" },
  { code: "USD", name: "United States dollar" },
  { code: "UYU", name: "Uruguayan peso" },
  { code: "UZS", name: "Uzbekistani som" },
  { code: "VND", name: "Vietnamese dong" },
  { code: "XAF", name: "Central African CFA franc" },
  { code: "XOF", name: "West African CFA franc" },
  { code: "YER", name: "Yemeni rial" },
  { code: "ZAR", name: "South African rand" },
];

const FLOWS: FlowDefinition[] = [
  {
    id: "creditCardDeposit",
    name: "Credit Card Deposit",
    description: "Process a credit card payment with optional 3D Secure authentication",
    requiredFields: [
      { id: "amount", label: "Amount", type: "number", placeholder: "100" },
      { id: "currency", label: "Currency", type: "select", placeholder: "USD" },
      { id: "userTokenId", label: "User Token ID", type: "text", placeholder: "SDKtest" },
      { id: "cardHolderName", label: "Card Holder Name", type: "text", placeholder: "Lee Gariny" }
    ]
  },
  {
    id: "apmDeposit",
    name: "APM Deposit",
    description: "Process a payment using Alternative Payment Methods",
    requiredFields: [
      { id: "amount", label: "Amount", type: "number", placeholder: "100" },
      { id: "currency", label: "Currency", type: "select", placeholder: "USD" },
      { id: "userTokenId", label: "User Token ID", type: "text", placeholder: "SDKtest" }
    ]
  }
];

type MethodParam = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  defaultValue?: string;
  format?: "json";
};

type SdkMethodDefinition = {
  id: SdkMethodName;
  name: string;
  description: string;
  params: MethodParam[];
};

const SDK_METHODS: SdkMethodDefinition[] = [
  {
    id: "getApms",
    name: "getApms()",
    description: "Retrieve available alternative payment methods (APMs) filtered by locale",
    params: [
      {
        id: "sessionToken",
        label: "Session Token",
        type: "text",
        placeholder: "Auto-generated",
        required: true,
        helperText: "Auto-filled via openOrder before calling getApms()"
      },
      {
        id: "countryCode",
        label: "Country Code",
        type: "text",
        placeholder: "US",
        helperText: "Optional 2-letter ISO country code filter"
      },
      {
        id: "currencyCode",
        label: "Currency Code",
        type: "text",
        placeholder: "USD",
        helperText: "Optional 3-letter ISO currency code"
      },
      {
        id: "languageCode",
        label: "Language Code",
        type: "text",
        placeholder: "en",
        helperText: "Optional locale for method labels"
      },
      {
        id: "type",
        label: "Type",
        type: "text",
        placeholder: "DEPOSIT",
        helperText: "Optional flow type (defaults to DEPOSIT)"
      }
    ]
  },
  {
    id: "getCardDetails",
    name: "getCardDetails()",
    description: "Fetch stored card details for a user token",
    params: [
      {
        id: "sessionToken",
        label: "Session Token",
        type: "text",
        placeholder: "Required",
        required: true,
        helperText: "Use the session token returned from openOrder or initSession"
      },
      {
        id: "cardNumber",
        label: "Card Number",
        type: "text",
        placeholder: "Card number",
        required: true,
        helperText: "The card number to retrieve details for"
      },
      {
        id: "clientRequestId",
        label: "Client Request ID",
        type: "text",
        placeholder: "Optional request ID",
        required: false,
        helperText: "Unique ID for the request"
      },
      {
        id: "clientUniqueId",
        label: "Client Unique ID",
        type: "text",
        placeholder: "Optional unique ID",
        required: false,
        helperText: "Unique ID for the client"
      }
    ]
  },
  {
    id: "getUserUPOs",
    name: "getUserUPOs()",
    description: "List all user payment options",
    params: [
      {
        id: "sessionToken",
        label: "Session Token",
        type: "text",
        placeholder: "Required",
        required: true,
        helperText: "Returned from openOrder / initSession"
      },
      {
        id: "userTokenId",
        label: "User Token ID",
        type: "text",
        placeholder: "yourUserTokenId",
        required: true,
        helperText: "User identifier whose UPOs you want to load"
      }
    ]
  },
  {
    id: "addApmUpo",
    name: "addApmUpo()",
    description: "Register a new APM UPO for the user",
    params: [
      {
        id: "sessionToken",
        label: "Session Token",
        type: "text",
        placeholder: "Required",
        required: true,
        helperText: "Use a fresh token from openOrder or getSessionToken"
      },
      {
        id: "userTokenId",
        label: "User Token ID",
        type: "text",
        placeholder: "yourUserTokenId",
        required: true
      },
      {
        id: "paymentMethodName",
        label: "Payment Method Name",
        type: "text",
        placeholder: "apmgw_PayPal",
        required: true,
        helperText: "Exact paymentMethod code from getApms (max 50 chars)"
      },
      {
        id: "apmData",
        label: "APM Data (JSON)",
        type: "textarea",
        placeholder: '{"beneficiaryBank":"STPMEX"}',
        required: true,
        helperText: "JSON object with APM-specific fields (see docs)",
        format: "json"
      },
      {
        id: "country",
        label: "Billing Country",
        type: "text",
        placeholder: "US",
        required: false,
        helperText: "2-letter ISO country code"
      },
      {
        id: "email",
        label: "Billing Email",
        type: "email",
        placeholder: "user@email.com",
        required: false,
        helperText: "Max 100 chars"
      },
      {
        id: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "John",
        required: false,
        helperText: "Max 30 chars"
      },
      {
        id: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        required: false,
        helperText: "Max 40 chars"
      },
      {
        id: "address",
        label: "Address",
        type: "text",
        placeholder: "123 Main St",
        required: false,
        helperText: "Max 50 chars"
      },
      {
        id: "cell",
        label: "Cell Phone",
        type: "text",
        placeholder: "+1234567890",
        required: false,
        helperText: "Max 18 chars"
      },
      {
        id: "phone",
        label: "Phone",
        type: "text",
        placeholder: "+1234567890",
        required: false,
        helperText: "Max 18 chars"
      },
      {
        id: "zip",
        label: "Zip Code",
        type: "text",
        placeholder: "12345",
        required: false,
        helperText: "Max 10 chars"
      },
      {
        id: "city",
        label: "City",
        type: "text",
        placeholder: "New York",
        required: false,
        helperText: "Max 30 chars"
      },
      {
        id: "state",
        label: "State",
        type: "text",
        placeholder: "NY",
        required: false,
        helperText: "Max 3 chars"
      }
    ]
  },
  {
    id: "addCardUpo",
    name: "addCardUpo()",
    description: "Create a card UPO using a temp token",
    params: [
      {
        id: "sessionToken",
        label: "Session Token",
        type: "text",
        placeholder: "Required",
        required: true,
        helperText: "Token returned from openOrder or initSession"
      },
      {
        id: "userTokenId",
        label: "User Token ID",
        type: "text",
        placeholder: "yourUserTokenId",
        required: true
      },
      {
        id: "cardNumber",
        label: "Card Number",
        type: "text",
        placeholder: "4000027891380961",
        required: true,
        helperText: "Max 20 chars"
      },
      {
        id: "expMonth",
        label: "Expiry Month",
        type: "text",
        placeholder: "12",
        required: true,
        helperText: "2 digits (01-12)"
      },
      {
        id: "expYear",
        label: "Expiry Year",
        type: "text",
        placeholder: "25",
        required: true,
        helperText: "2 digits (YY)"
      },
      {
        id: "cardHolderName",
        label: "Card Holder Name",
        type: "text",
        placeholder: "Lee Gariny",
        required: true,
        helperText: "Max 70 chars"
      },
      {
        id: "country",
        label: "Billing Country",
        type: "text",
        placeholder: "US",
        required: false,
        helperText: "2-letter ISO country code"
      },
      {
        id: "email",
        label: "Billing Email",
        type: "email",
        placeholder: "user@email.com",
        required: false,
        helperText: "Max 100 chars"
      },
      {
        id: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "John",
        required: false,
        helperText: "Max 30 chars"
      },
      {
        id: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        required: false,
        helperText: "Max 40 chars"
      },
      {
        id: "address",
        label: "Address",
        type: "text",
        placeholder: "123 Main St",
        required: false,
        helperText: "Max 50 chars"
      },
      {
        id: "cell",
        label: "Cell Phone",
        type: "text",
        placeholder: "+1234567890",
        required: false,
        helperText: "Max 18 chars"
      },
      {
        id: "phone",
        label: "Phone",
        type: "text",
        placeholder: "+1234567890",
        required: false,
        helperText: "Max 18 chars"
      },
      {
        id: "zip",
        label: "Zip Code",
        type: "text",
        placeholder: "12345",
        required: false,
        helperText: "Max 10 chars"
      },
      {
        id: "city",
        label: "City",
        type: "text",
        placeholder: "New York",
        required: false,
        helperText: "Max 30 chars"
      },
      {
        id: "state",
        label: "State",
        type: "text",
        placeholder: "NY",
        required: false,
        helperText: "Max 3 chars"
      }
    ]
  }
];

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return "";
}

export default function Home() {
  const [merchantId, setMerchantId] = useState("");
  const [merchantSiteId, setMerchantSiteId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [notificationUrl, setNotificationUrl] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<FlowName | "">("");
  const [flowParams, setFlowParams] = useState<Record<string, string>>({
    amount: "100", // Default amount
    currency: "USD", // Default currency
    userTokenId: "SDKtest",
    cardHolderName: "Lee Gariny"
  });
  const [response, setResponse] = useState<any>(null);
  const [logs, setLogs] = useState<(string | any)[]>([]);
  const [loading, setLoading] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [nuveiFieldsReady, setNuveiFieldsReady] = useState(false);
  const [nuveiSdkLoaded, setNuveiSdkLoaded] = useState(false);
  const [nuveiInitError, setNuveiInitError] = useState<string | null>(null);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [availableApms, setAvailableApms] = useState<any[]>([]);
  const [selectedApm, setSelectedApm] = useState<string>("");
  const [apmFields, setApmFields] = useState<any[]>([]);
  const [apmsFetched, setApmsFetched] = useState(false);
  const prevFlowRef = useRef<FlowName | "">("");
  const [selectedSdkMethod, setSelectedSdkMethod] = useState<SdkMethodName | "">("");
  const [activeTab, setActiveTab] = useState<'flows' | 'methods'>('flows');
  const [sdkMethodParams, setSdkMethodParams] = useState<Record<string, string>>({});
  const [sdkMethodLoading, setSdkMethodLoading] = useState(false);
  const [sdkInstanceError, setSdkInstanceError] = useState<string | null>(null);
  const [sdkSessionPending, setSdkSessionPending] = useState(false);
  const [sdkSessionStatus, setSdkSessionStatus] = useState<string | null>(null);
  const sdkInstanceRef = useRef<any>(null);

  // Theme state
  const [consoleTheme, setConsoleTheme] = useState<string>("default");
  const [apiResponseTheme, setApiResponseTheme] = useState<string>("default");

  // Load values from cookies on mount
  useEffect(() => {
    const savedMerchantId = getCookie("nuvei_merchantId");
    const savedMerchantSiteId = getCookie("nuvei_merchantSiteId");
    const savedSecretKey = getCookie("nuvei_secretKey");
    const savedNotificationUrl = getCookie("nuvei_notificationUrl");
    const savedAmount = getCookie("nuvei_amount");
    const savedCurrency = getCookie("nuvei_currency");
    const savedCardHolderName = getCookie("nuvei_cardHolderName");
    const savedFirstName = getCookie("nuvei_firstName");
    const savedLastName = getCookie("nuvei_lastName");
    const savedEmail = getCookie("nuvei_email");
    const savedCountry = getCookie("nuvei_country");
    const savedIpAddress = getCookie("nuvei_ipAddress");
    const savedUserTokenId = getCookie("nuvei_userTokenId");

    if (savedMerchantId) setMerchantId(savedMerchantId);
    if (savedMerchantSiteId) setMerchantSiteId(savedMerchantSiteId);
    if (savedSecretKey) setSecretKey(savedSecretKey);
    if (savedNotificationUrl) setNotificationUrl(savedNotificationUrl);

    // Load all saved values with defaults
    setFlowParams(prev => ({
      ...prev,
      amount: savedAmount || "100",
      currency: savedCurrency || "USD",
      userTokenId: savedUserTokenId || "SDKtest",
      cardHolderName: savedCardHolderName || "Lee Gariny",
      firstName: savedFirstName || "",
      lastName: savedLastName || "",
      email: savedEmail || "",
      country: savedCountry || "",
      ipAddress: savedIpAddress || ""
    }));
  }, []);

  useEffect(() => {
    if (!sessionToken || !selectedSdkMethod) return;
    const definition = SDK_METHODS.find((m) => m.id === selectedSdkMethod);
    if (!definition) return;
    if (!definition.params.some((param) => param.id === "sessionToken")) return;
    setSdkMethodParams((prev) => {
      if (prev.sessionToken && prev.sessionToken.length > 0) {
        return prev;
      }
      return {
        ...prev,
        sessionToken,
      };
    });
  }, [sessionToken, selectedSdkMethod]);

  // Save values to cookies (save on blur or after typing stops)
  const saveToCookie = (name: string, value: string) => {
    if (value.trim()) {
      setCookie(name, value);
    } else {
      // Clear cookie if value is empty
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  };

  const handleMerchantIdBlur = () => saveToCookie("nuvei_merchantId", merchantId);
  const handleMerchantSiteIdBlur = () => saveToCookie("nuvei_merchantSiteId", merchantSiteId);
  const handleSecretKeyBlur = () => saveToCookie("nuvei_secretKey", secretKey);
  const handleNotificationUrlBlur = () => saveToCookie("nuvei_notificationUrl", notificationUrl);

  // Initiate session for Nuvei Fields - defined early so it can be used in useEffect
  // Always call openOrder so every flow (including SDK helper methods) shares the same sessionToken
  const initiateSession = React.useCallback(async () => {
    if (!merchantId || !merchantSiteId || !secretKey) {
      return;
    }

    // For openOrder, we also need amount and currency (use defaults if not set)
    const amount = flowParams.amount || "100";
    const currency = flowParams.currency || "USD";

    try {
      const flowLabel = selectedFlow === "apmDeposit" ? "APM flow" : "Credit Card flow";
      console.log('Initiating session (openOrder) with:', { amount, currency, flow: flowLabel });
      setLogs((prev) => [...prev, `Calling openOrder for ${flowLabel} (${amount} ${currency})...`]);

      const res = await fetch("/api/open-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          merchantSiteId,
          secretKey,
          amount,
          currency,
          userTokenId: flowParams.userTokenId || "SDKtest",
          notificationUrl: notificationUrl || undefined, // Optional DMN webhook URL
        })
      });

      const data = await res.json();
      if (data.ok && data.sessionToken) {
        setSessionToken(data.sessionToken);
        // Store orderId and full response for later use in createPayment / SDK helpers
        (window as any).nuveiOrderId = data.orderId;
        (window as any).nuveiOpenOrderResponse = data;
        const truncated = data.sessionToken.substring(0, 20) + '...';
        console.log('openOrder successful, orderId:', data.orderId, 'sessionToken:', truncated);
        setLogs((prev) => [...prev, `✓ openOrder ready (orderId ${data.orderId}, sessionToken ${truncated})`]);
      } else {
        console.error('openOrder failed:', data);
        setLogs((prev) => [...prev, `ERROR: openOrder failed - ${data.error || data.message || 'Unknown error'}`]);
      }
    } catch (error) {
      console.error("Error initiating session:", error);
      setLogs((prev) => [...prev, `ERROR: ${error instanceof Error ? error.message : 'Failed to initiate session'}`]);
    }
  }, [merchantId, merchantSiteId, secretKey, flowParams, notificationUrl, selectedFlow]);

  const initializeNuveiFields = React.useCallback(() => {
    // @ts-ignore - SafeCharge is loaded from CDN
    if (typeof SafeCharge === 'undefined') {
      console.error('Nuvei Web SDK not loaded yet');
      setNuveiInitError('Nuvei Web SDK not loaded. Please wait...');
      return false;
    }

    // Check if DOM elements exist
    const cardNumberDiv = document.getElementById('nuvei-card-number');
    const cardExpiryDiv = document.getElementById('nuvei-card-expiry');
    const cardCvvDiv = document.getElementById('nuvei-card-cvv');

    if (!cardNumberDiv || !cardExpiryDiv || !cardCvvDiv) {
      console.error('Nuvei Fields containers not found in DOM');
      setNuveiInitError('Card field containers not ready. Please try again.');
      return false;
    }

    setNuveiInitError(null);

    try {
      // Clear any existing fields first
      cardNumberDiv.innerHTML = '';
      cardExpiryDiv.innerHTML = '';
      cardCvvDiv.innerHTML = '';

      // @ts-ignore
      const sfc = SafeCharge({
        env: 'int', // Change to 'prod' for production
        merchantId: merchantId,
        merchantSiteId: merchantSiteId,
        sessionToken: sessionToken,
      });

      console.log('SafeCharge initialized with:', {
        env: 'int',
        merchantId: merchantId,
        merchantSiteId: merchantSiteId,
        sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : 'MISSING'
      });
      setLogs((prev) => [...prev, `SafeCharge initialized with session token: ${sessionToken ? 'Present' : 'MISSING'}`]);

      // Verify SafeCharge instance has required methods
      const hasGetToken = typeof sfc.getToken === 'function';
      const hasFields = typeof sfc.fields === 'function';
      console.log('SafeCharge methods available:', { hasGetToken, hasFields });
      setLogs((prev) => [...prev, `SafeCharge methods - getToken: ${hasGetToken}, fields: ${hasFields}`]);

      if (!hasGetToken || !hasFields) {
        throw new Error('SafeCharge instance missing required methods. SDK may not be properly loaded.');
      }

      console.log('SafeCharge initialized, creating fields...');

      // Create the fields object
      const fieldStyles = {
        base: {
          fontSize: '16px',
          color: nightMode ? '#ffffff' : '#1a1a1a',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: nightMode ? '#888' : '#999',
          },
        },
        invalid: {
          color: '#ff6b6b',
        },
      };

      // @ts-ignore
      const safeChargeFields = sfc.fields({
        fonts: []
      });

      // Create Card Number Field
      const cardNumber = safeChargeFields.create('ccNumber', {
        style: fieldStyles
      });
      cardNumber.attach('#nuvei-card-number');

      // Listen for card number field changes and validation
      cardNumber.on('change', (evt: any) => {
        const isComplete = evt.complete === true;
        setCardNumberComplete(isComplete);
        if (evt.error) {
          console.log('Card Number Error:', evt.error.code);
          setLogs((prev) => [...prev, `Card Number Error: ${evt.error.code}`]);
        } else if (isComplete) {
          setLogs((prev) => [...prev, 'Card number field is complete']);
        }
      });

      // Create Expiry Field
      const cardExpiry = safeChargeFields.create('ccExpiration', {
        style: fieldStyles
      });
      cardExpiry.attach('#nuvei-card-expiry');

      // Listen for expiry field changes and validation
      cardExpiry.on('change', (evt: any) => {
        const isComplete = evt.complete === true;
        setCardExpiryComplete(isComplete);
        if (evt.error) {
          console.log('Card Expiry Error:', evt.error.code);
          setLogs((prev) => [...prev, `Card Expiry Error: ${evt.error.code}`]);
        } else if (isComplete) {
          setLogs((prev) => [...prev, 'Card expiry field is complete']);
        }
      });

      // Create CVV Field
      const cardCvc = safeChargeFields.create('ccCvc', {
        style: fieldStyles
      });
      cardCvc.attach('#nuvei-card-cvv');

      // Listen for CVV field changes and validation
      cardCvc.on('change', (evt: any) => {
        const isComplete = evt.complete === true;
        setCardCvcComplete(isComplete);
        if (evt.error) {
          console.log('Card CVV Error:', evt.error.code);
          setLogs((prev) => [...prev, `Card CVV Error: ${evt.error.code}`]);
        } else if (isComplete) {
          setLogs((prev) => [...prev, 'Card CVV field is complete']);
        }
      });

      console.log('Nuvei Fields created successfully');

      // Store references for tokenization
      const nuveiFieldsData = {
        sfc: sfc,
        cardNumber: cardNumber,
        cardExpiry: cardExpiry,
        cardCvc: cardCvc
      };

      // Wait a bit to ensure fields are rendered
      setTimeout(() => {
        setNuveiFieldsReady(true);
        setLogs((prev) => [...prev, 'Nuvei Fields are ready. Please fill in card details.']);
      }, 500);

      // Store sfc instance and field references globally for use in handleRunFlow
      (window as any).nuveiSfc = sfc;
      (window as any).nuveiFields = nuveiFieldsData;
      return true;
    } catch (error: any) {
      console.error('Error initializing Nuvei Fields:', error);
      setNuveiInitError(error.message || 'Failed to initialize Nuvei Fields');
      setNuveiFieldsReady(false);
      return false;
    }
  }, [merchantId, merchantSiteId, sessionToken, nightMode]);

  // Load Nuvei Web SDK
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="safecharge.js"]');
    if (existingScript) {
      // @ts-ignore
      if (typeof SafeCharge !== 'undefined') {
        setNuveiSdkLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.safecharge.com/safecharge_resources/v1/websdk/safecharge.js';
    script.async = true;
    script.onload = () => {
      console.log('Nuvei Web SDK loaded');
      setNuveiSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Nuvei Web SDK');
      setNuveiInitError('Failed to load Nuvei Web SDK. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount (but only if we created it)
      const scriptToRemove = document.querySelector('script[src*="safecharge.js"]');
      if (scriptToRemove && scriptToRemove === script) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Auto-initiate session when a flow is selected and credentials are filled
  // We now always call openOrder so both card + APM flows share a valid session token
  useEffect(() => {
    const amount = flowParams.amount || "100";
    const currency = flowParams.currency || "USD";

    if ((selectedFlow === "creditCardDeposit" || selectedFlow === "apmDeposit") &&
      merchantId && merchantSiteId && secretKey && amount && currency && !sessionToken) {
      console.log('Auto-initiating session with:', { merchantId, merchantSiteId, amount, currency, flow: selectedFlow });
      initiateSession();
    }
  }, [selectedFlow, merchantId, merchantSiteId, secretKey, flowParams.amount, flowParams.currency, sessionToken, initiateSession]);

  // Fetch available APMs when APM Deposit is selected using Web SDK getApms()
  useEffect(() => {
    if (selectedFlow === "apmDeposit" && merchantId && merchantSiteId && sessionToken && !apmsFetched) {
      const fetchApms = async () => {
        try {
          setLogs(prev => [...prev, 'Fetching available payment methods using Web SDK...']);

          // Check if Nuvei SDK constructor is loaded
          const SafeCharge = (window as any).SafeCharge;
          if (typeof SafeCharge !== 'function') {
            throw new Error('Nuvei SDK not loaded');
          }

          // Initialize SDK instance with merchant credentials
          console.log('Initializing Nuvei SDK for getApms...');
          setLogs(prev => [...prev, 'Initializing Nuvei Web SDK instance...']);

          const sfc = SafeCharge({
            env: 'test', // Use 'prod' for production
            merchantId: merchantId,
            merchantSiteId: merchantSiteId
          });

          console.log('SDK initialized, instance:', sfc);
          console.log('Available methods on instance:', Object.keys(sfc));
          console.log('getApms available?', typeof sfc.getApms);
          setLogs(prev => [...prev, `SDK initialized. Methods available: ${Object.keys(sfc).join(', ')}`]);

          if (typeof sfc.getApms !== 'function') {
            throw new Error('getApms() method not found on SDK instance. Available methods: ' + Object.keys(sfc).join(', '));
          }

          // Call getApms() from Web SDK (without countryCode to get all APMs)
          const payload = {
            sessionToken: sessionToken,
            merchantId: merchantId,
            merchantSiteId: merchantSiteId,
            languageCode: "en"
          };

          console.log('Calling sfc.getApms() with payload:', payload);
          setLogs(prev => [...prev, 'Calling getApms() method...']);
          setLogs(prev => [...prev, `  merchantId: ${merchantId}`]);
          setLogs(prev => [...prev, `  merchantSiteId: ${merchantSiteId}`]);
          setLogs(prev => [...prev, `  sessionToken: ${sessionToken.substring(0, 20)}...`]);
          setLogs(prev => [...prev, `  languageCode: en`]);
          setLogs(prev => [...prev, `  (no countryCode - fetching all available APMs)`]);

          const apmsResult: any = await new Promise((resolve, reject) => {
            // @ts-ignore
            sfc.getApms(payload, function (result: any) {
              console.log('getApms() raw result:', result);
              resolve(result);
            });
          });

          setLogs(prev => [...prev, `getApms() call completed with status: ${apmsResult?.status || 'unknown'}`]);

          console.log('Full APMs result:', apmsResult);
          setLogs(prev => [...prev, `Raw API response received with ${apmsResult?.paymentMethods?.length || 0} total payment methods`]);

          if (apmsResult && apmsResult.paymentMethods) {
            console.log('Total payment methods received:', apmsResult.paymentMethods.length);
            setLogs(prev => [...prev, `Processing ${apmsResult.paymentMethods.length} payment methods...`]);

            // Log all payment methods before filtering
            console.log('All payment methods before filtering:', apmsResult.paymentMethods.map((pm: any) => pm.paymentMethod));

            // Filter out credit cards, Apple Pay, Google Pay, Moneybookers
            const filteredApms = apmsResult.paymentMethods.filter((pm: any) => {
              const pmName = (pm.paymentMethod || '').toLowerCase();

              let filtered = false;
              let reason = '';

              if (pmName === 'cc_card' || pmName.includes('cc_card')) {
                filtered = true;
                reason = 'Credit card';
              } else if (pmName.includes('applepay')) {
                filtered = true;
                reason = 'Apple Pay';
              } else if (pmName.includes('googlepay')) {
                filtered = true;
                reason = 'Google Pay';
              } else if (pmName.includes('moneybookers')) {
                filtered = true;
                reason = 'Moneybookers';
              }

              if (filtered) {
                console.log(`Filtered out: ${pm.paymentMethod} (${reason})`);
                setLogs(prev => [...prev, `  ❌ Excluded: ${pm.paymentMethod} (${reason})`]);
              }

              return !filtered;
            });

            console.log('Payment methods after filtering:', filteredApms.length);
            console.log('Filtered APMs list:', filteredApms.map((pm: any) => pm.paymentMethod));
            setLogs(prev => [...prev, `After filtering: ${filteredApms.length} APMs remaining`]);

            // Sort APMs alphabetically by display name
            const sortedApms = filteredApms.sort((a: any, b: any) => {
              const nameA = typeof a.paymentMethodDisplayName === 'object'
                ? a.paymentMethodDisplayName?.message || a.paymentMethod
                : a.paymentMethodDisplayName || a.paymentMethod;
              const nameB = typeof b.paymentMethodDisplayName === 'object'
                ? b.paymentMethodDisplayName?.message || b.paymentMethod
                : b.paymentMethodDisplayName || b.paymentMethod;
              return nameA.localeCompare(nameB);
            });

            // Log each included APM
            sortedApms.forEach((apm: any) => {
              const displayName = typeof apm.paymentMethodDisplayName === 'object'
                ? apm.paymentMethodDisplayName?.message || apm.paymentMethod
                : apm.paymentMethodDisplayName || apm.paymentMethod;
              console.log(`  ✅ Included: ${apm.paymentMethod} - ${displayName}`);
              setLogs(prev => [...prev, `  ✅ ${displayName} (${apm.paymentMethod})`]);
            });

            setAvailableApms(sortedApms);
            setApmsFetched(true); // Mark as fetched to prevent re-fetching
            setLogs(prev => [...prev, `✓ Successfully loaded ${sortedApms.length} available payment methods`]);
            setLogs(prev => [...prev, `✓ Successfully loaded ${sortedApms.length} available payment methods`]);
            setLogs(prev => [...prev, 'Available APMs with full data:', sortedApms]);
          } else {
            throw new Error('No payment methods returned from getApms()');
          }
        } catch (error: any) {
          console.error('Error fetching APMs via SDK:', error);
          setLogs(prev => [...prev, `ERROR while calling getApms(): ${error.message}`]);
          alert(`Nuvei getApms() failed: ${error.message}. Please verify credentials/session token and try again.`);
          setAvailableApms([]);
        }
      };

      fetchApms();
    } else if (selectedFlow !== "apmDeposit") {
      // Clear APMs when switching away and reset flag
      setAvailableApms([]);
      setSelectedApm("");
      setApmFields([]);
      setApmsFetched(false);
    }
  }, [selectedFlow, merchantId, merchantSiteId, secretKey, sessionToken, apmsFetched]);

  // Initialize Nuvei Fields when session token is available and SDK is loaded
  useEffect(() => {
    if (selectedFlow === "creditCardDeposit" && merchantId && merchantSiteId && sessionToken) {
      let retryCount = 0;
      const maxRetries = 10;

      const tryInitialize = () => {
        // Check if SafeCharge is available
        // @ts-ignore
        const sdkAvailable = typeof SafeCharge !== 'undefined';

        // Check if DOM containers exist
        const containersReady =
          document.getElementById('nuvei-card-number') &&
          document.getElementById('nuvei-card-expiry') &&
          document.getElementById('nuvei-card-cvv');

        if (sdkAvailable && containersReady) {
          setNuveiSdkLoaded(true);
          const success = initializeNuveiFields();
          if (!success && retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryInitialize, 500);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryInitialize, 500);
        } else {
          setNuveiInitError('Failed to load Nuvei SDK or card field containers. Please refresh the page.');
        }
      };

      // Start trying after a short delay to ensure DOM is ready
      const timer = setTimeout(tryInitialize, 300);
      prevFlowRef.current = "creditCardDeposit";
      return () => clearTimeout(timer);
    } else if (prevFlowRef.current === "creditCardDeposit" && selectedFlow !== "creditCardDeposit") {
      // Clean up Nuvei Fields containers when switching away from card flow
      setNuveiFieldsReady(false);
      setNuveiInitError(null);
      setSessionToken(null);
      const cardNumberDiv = document.getElementById('nuvei-card-number');
      const cardExpiryDiv = document.getElementById('nuvei-card-expiry');
      const cardCvvDiv = document.getElementById('nuvei-card-cvv');
      if (cardNumberDiv) cardNumberDiv.innerHTML = '';
      if (cardExpiryDiv) cardExpiryDiv.innerHTML = '';
      if (cardCvvDiv) cardCvvDiv.innerHTML = '';
      prevFlowRef.current = selectedFlow;
    } else {
      prevFlowRef.current = selectedFlow;
    }
  }, [selectedFlow, merchantId, merchantSiteId, sessionToken, initializeNuveiFields]);

  // Handle flow selection change
  const handleFlowChange = (flowId: string) => {
    setSelectedFlow(flowId as FlowName);
    setFlowParams({
      amount: "100", // Keep default amount
      currency: "USD", // Keep default currency
      userTokenId: "SDKtest",
      cardHolderName: "Lee Gariny"
    }); // Reset flow parameters when flow changes (but keep amount/currency defaults)
    saveToCookie('nuvei_userTokenId', 'SDKtest');
    saveToCookie('nuvei_cardHolderName', 'Lee Gariny');
    setResponse(null);
    setNuveiFieldsReady(false);

    // Clear APM-specific state
    setSelectedApm("");
    setApmFields([]);
    setSessionToken(null);
    // Reset field completion status
    setCardNumberComplete(false);
    setCardExpiryComplete(false);
    setCardCvcComplete(false);
  };

  const currentMethod = SDK_METHODS.find((m) => m.id === selectedSdkMethod);
  const sdkMethodNeedsSessionToken = currentMethod?.params.some((param) => param.id === "sessionToken") ?? false;

  const ensureSdkSessionToken = React.useCallback(async (): Promise<string | null> => {
    if (sessionToken) {
      setSdkSessionStatus(null);
      return sessionToken;
    }

    if (sdkSessionPending) {
      return null;
    }

    if (!merchantId || !merchantSiteId || !secretKey) {
      setSdkSessionStatus("Enter merchant credentials to auto-fetch a session token.");
      return null;
    }

    const amount = flowParams.amount || "100";
    const currency = flowParams.currency || "USD";

    try {
      setSdkSessionPending(true);
      setSdkSessionStatus("Requesting session token via openOrder...");
      setLogs((prev) => [...prev, "Auto-fetching session token via openOrder for SDK Methods..."]);

      const res = await fetch("/api/open-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          merchantSiteId,
          secretKey,
          amount,
          currency,
          userTokenId: flowParams.userTokenId || "SDKtest",
          notificationUrl: notificationUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.ok && data.sessionToken) {
        setSessionToken(data.sessionToken);
        (window as any).nuveiOrderId = data.orderId;
        (window as any).nuveiOpenOrderResponse = data;
        setSdkSessionStatus("Session token ready.");
        setLogs((prev) => [...prev, `✓ Session token ready for SDK Methods (orderId ${data.orderId})`]);
        return data.sessionToken;
      }

      throw new Error(data.error || data.message || "Failed to fetch session token via openOrder.");
    } catch (error: any) {
      const message = error?.message || "Failed to fetch session token via openOrder.";
      setSdkSessionStatus(message);
      setLogs((prev) => [...prev, `ERROR: ${message}`]);
      return null;
    } finally {
      setSdkSessionPending(false);
    }
  }, [sessionToken, sdkSessionPending, merchantId, merchantSiteId, secretKey, flowParams.amount, flowParams.currency, flowParams.userTokenId, notificationUrl]);

  useEffect(() => {
    if (!currentMethod || !sdkMethodNeedsSessionToken) {
      setSdkSessionStatus(null);
      return;
    }

    if (!sessionToken && !sdkSessionPending) {
      ensureSdkSessionToken();
    }
  }, [currentMethod, sdkMethodNeedsSessionToken, sessionToken, sdkSessionPending, ensureSdkSessionToken]);

  const buildSdkInstance = (sessionTokenOverride?: string) => {
    if (typeof window === "undefined") {
      return null;
    }

    const SafeChargeCtor = (window as any).SafeCharge;
    if (typeof SafeChargeCtor !== "function") {
      setSdkInstanceError("Nuvei Web SDK is not loaded yet. Run a payment flow or ensure the script is included.");
      return null;
    }

    if (!merchantId || !merchantSiteId) {
      setSdkInstanceError("Merchant credentials are required to initialize the SafeCharge SDK.");
      return null;
    }

    const resolvedSessionToken = sessionTokenOverride || sdkMethodParams.sessionToken || sessionToken || undefined;
    const config: Record<string, string> = {
      env: process.env.NEXT_PUBLIC_NUVEI_ENV || "int",
      merchantId,
      merchantSiteId,
    };

    if (resolvedSessionToken) {
      config.sessionToken = resolvedSessionToken;
    }

    try {
      sdkInstanceRef.current = SafeChargeCtor(config);
      setSdkInstanceError(null);
      return sdkInstanceRef.current;
    } catch (error: any) {
      const message = error?.message || "Failed to initialize SafeCharge SDK";
      setSdkInstanceError(message);
      setLogs((prev) => [...prev, `ERROR: ${message}`]);
      return null;
    }
  };

  const handleMethodChange = (methodId: string) => {
    setSelectedSdkMethod(methodId as SdkMethodName);
    const definition = SDK_METHODS.find((m) => m.id === methodId);
    if (definition) {
      const defaults: Record<string, string> = {};
      definition.params.forEach((param) => {
        if (param.id === "sessionToken" && sessionToken) {
          defaults[param.id] = sessionToken;
          return;
        }
        if (param.id === "userTokenId") {
          defaults[param.id] = flowParams.userTokenId || "SDKtest";
          return;
        }
        if (param.id === "cardHolderName") {
          defaults[param.id] = flowParams.cardHolderName || "Lee Gariny";
          return;
        }
        if (param.id === "billingCountry" && flowParams.country) {
          defaults[param.id] = flowParams.country;
          return;
        }
        if (param.id === "billingEmail" && flowParams.email) {
          defaults[param.id] = flowParams.email;
          return;
        }
        if (typeof param.defaultValue !== "undefined") {
          defaults[param.id] = param.defaultValue;
          return;
        }
        defaults[param.id] = "";
      });
      setSdkMethodParams(defaults);
      if (definition.params.some((param) => param.id === "sessionToken")) {
        ensureSdkSessionToken();
      }
      buildSdkInstance(defaults.sessionToken);
    } else {
      setSdkMethodParams({});
      buildSdkInstance();
    }
  };

  const handleMethodParamChange = (paramId: string, value: string) => {
    setSdkMethodParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const methodFieldIsValid = (param: MethodParam) => {
    if (!param.required) return true;
    return Boolean((sdkMethodParams[param.id] ?? "").trim());
  };

  const isSdkMethodFormValid = () => {
    if (!currentMethod) return false;
    return currentMethod.params.every(methodFieldIsValid);
  };

  const runSdkMethod = async () => {
    if (!selectedSdkMethod || !currentMethod) {
      alert("Please select an SDK method");
      return;
    }

    if (!merchantId || !merchantSiteId || !secretKey) {
      alert("Please fill in merchant credentials first");
      return;
    }

    if (!isSdkMethodFormValid()) {
      alert("Please fill in all mandatory fields for the selected method");
      return;
    }

    let paramsSnapshot = { ...sdkMethodParams };

    if (sdkMethodNeedsSessionToken) {
      const tokenValue = paramsSnapshot.sessionToken?.trim();
      if (!tokenValue) {
        const ensuredToken = await ensureSdkSessionToken();
        if (!ensuredToken) {
          alert("Unable to obtain a session token via openOrder. Please verify credentials and try again.");
          return;
        }
        paramsSnapshot = {
          ...paramsSnapshot,
          sessionToken: ensuredToken,
        };
        setSdkMethodParams(paramsSnapshot);
      }
    }

    // Build payload using filled params
    const payload: Record<string, unknown> = {
      merchantId,
      merchantSiteId,
    };
    for (const param of currentMethod.params) {
      const rawValue = paramsSnapshot[param.id];
      if (!rawValue || rawValue.trim() === "") {
        continue;
      }

      if (param.format === "json") {
        try {
          payload[param.id] = JSON.parse(rawValue);
        } catch (error) {
          const parseMessage = `Invalid JSON provided for ${param.label}.`;
          const errorDetails = error instanceof Error ? ` ${error.message}` : "";
          setLogs((prev) => [...prev, `ERROR: ${parseMessage}${errorDetails}`]);
          alert(`${parseMessage} Please review Nuvei docs for the expected structure.`);
          return;
        }
        continue;
      }

      payload[param.id] = rawValue.trim();
    }

    setSdkMethodLoading(true);
    setLogs((prev) => [
      ...prev,
      `=== Running SDK Method: ${currentMethod.name} ===`,
      `Payload:`,
      payload,
    ]);

    try {
      const sfcInstance = buildSdkInstance(payload.sessionToken as string | undefined);
      if (!sfcInstance) {
        throw new Error("SafeCharge SDK instance is not ready. Check credentials or session token.");
      }

      const sdkFn = (sfcInstance as any)[selectedSdkMethod];
      if (typeof sdkFn !== "function") {
        throw new Error(`${currentMethod.name} is not available on the SDK instance.`);
      }

      const methodResult: any = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`SDK method ${selectedSdkMethod} timed out after 10 seconds`));
        }, 10000);

        try {
          console.log(`Calling SDK method ${selectedSdkMethod} with payload:`, payload);

          // Define callback for traditional style
          const callback = (result: any) => {
            clearTimeout(timeoutId);
            console.log(`SDK method ${selectedSdkMethod} callback received:`, result);
            resolve(result);
          };

          // Special case: getUserUPOs only takes a callback, not a payload
          // According to Nuvei docs: sfc.getUserUPOs(function(response) {...})
          let resultOrPromise;
          if (selectedSdkMethod === 'getUserUPOs') {
            console.log(`getUserUPOs: calling with callback only (no payload)`);
            resultOrPromise = sdkFn.call(sfcInstance, callback);
          } else {
            // Standard: call with (payload, callback)
            resultOrPromise = sdkFn.call(sfcInstance, payload, callback);
          }

          // Check if it returned a Promise (modern SDK style)
          if (resultOrPromise && typeof resultOrPromise.then === 'function') {
            console.log(`SDK method ${selectedSdkMethod} returned a Promise. Waiting for resolution...`);
            resultOrPromise
              .then((result: any) => {
                clearTimeout(timeoutId);
                console.log(`SDK method ${selectedSdkMethod} Promise resolved:`, result);
                resolve(result);
              })
              .catch((err: any) => {
                clearTimeout(timeoutId);
                console.error(`SDK method ${selectedSdkMethod} Promise rejected:`, err);
                reject(err);
              });
          }
          // Check if it returned a synchronous result (legacy/specific method style)
          else if (resultOrPromise && typeof resultOrPromise === 'object') {
            console.log(`SDK method ${selectedSdkMethod} returned a synchronous result:`, resultOrPromise);
            clearTimeout(timeoutId);
            resolve(resultOrPromise);
          }
          // Otherwise, wait for callback (already configured)
        } catch (methodError) {
          clearTimeout(timeoutId);
          console.error(`SDK method ${selectedSdkMethod} threw synchronous error:`, methodError);
          reject(methodError);
        }
      });

      setLogs((prev) => [
        ...prev,
        `${currentMethod.name} result:`,
        methodResult,
        `=== SDK Method Completed ===`,
      ]);

      setResponse({
        ok: true,
        source: "sdkMethod",
        method: currentMethod.name,
        payload,
        result: methodResult,
      });
    } catch (error: any) {
      const message = error?.message || "Failed to run SDK method";
      setLogs((prev) => [...prev, `ERROR: ${message}`]);
      alert(message);
    } finally {
      setSdkMethodLoading(false);
    }
  };

  // Handle flow parameter change
  const handleFlowParamChange = (fieldId: string, value: string) => {
    const normalizedValue = (() => {
      if (fieldId === 'country') {
        return value.toUpperCase();
      }
      if (fieldId === 'userTokenId') {
        const trimmed = value.trim();
        return trimmed === "" ? "SDKtest" : trimmed;
      }
      if (fieldId === 'cardHolderName') {
        const trimmed = value.trim();
        return trimmed === "" ? "Lee Gariny" : trimmed;
      }
      return value;
    })();

    setFlowParams(prev => ({
      ...prev,
      [fieldId]: normalizedValue
    }));

    // Save to cookies for persistence
    if (fieldId === 'amount') {
      saveToCookie('nuvei_amount', normalizedValue);
      // Reset session when amount changes (for credit card flow)
      if (selectedFlow === 'creditCardDeposit') {
        setSessionToken(null); // This will trigger openOrder with new amount
        setNuveiFieldsReady(false);
      }
    } else if (fieldId === 'currency') {
      saveToCookie('nuvei_currency', normalizedValue);
      // Reset session when currency changes (for credit card flow)
      if (selectedFlow === 'creditCardDeposit') {
        setSessionToken(null); // This will trigger openOrder with new currency
        setNuveiFieldsReady(false);
      }
    } else if (fieldId === 'cardHolderName') {
      saveToCookie('nuvei_cardHolderName', normalizedValue);
    } else if (fieldId === 'firstName') {
      saveToCookie('nuvei_firstName', normalizedValue);
    } else if (fieldId === 'lastName') {
      saveToCookie('nuvei_lastName', normalizedValue);
    } else if (fieldId === 'email') {
      saveToCookie('nuvei_email', normalizedValue);
    } else if (fieldId === 'country') {
      saveToCookie('nuvei_country', normalizedValue);
    } else if (fieldId === 'ipAddress') {
      saveToCookie('nuvei_ipAddress', normalizedValue);
    } else if (fieldId === 'userTokenId') {
      saveToCookie('nuvei_userTokenId', normalizedValue);
    }
  };

  // Get current flow definition
  const currentFlow = FLOWS.find(f => f.id === selectedFlow);

  async function handleRunFlow() {
    if (!selectedFlow) {
      alert("Please select a flow first");
      return;
    }

    // Special handling for credit card deposit - CORRECT FLOW per Nuvei docs:
    // 1. openOrder was already called when flow was selected (in useEffect)
    // 2. Nuvei Fields were already initialized with that openOrder session token
    // 3. User already entered card details before clicking "Run Flow"
    // 4. Now we just need to: getToken() → createPayment() using same session
    // 5. SDK will automatically show 3DS challenge popup if needed
    if (selectedFlow === "creditCardDeposit") {
      setLogs(['=== Starting Credit Card Deposit Flow ===']);

      // Validate merchant credentials
      if (!merchantId || !merchantSiteId || !secretKey) {
        alert("Please fill in all merchant credentials");
        return;
      }

      // Validate required flow parameters (use defaults if not explicitly set)
      const amount = flowParams.amount || "100";
      const currency = flowParams.currency || "USD";

      if (!amount || !currency) {
        alert("Please fill in amount and currency fields");
        return;
      }

      // Validate that Nuvei Fields are ready and session token exists
      if (!sessionToken || !nuveiFieldsReady) {
        alert("Please wait for card fields to initialize, or fill in amount/currency first");
        return;
      }

      // Validate that all card fields are complete
      if (!cardNumberComplete || !cardExpiryComplete || !cardCvcComplete) {
        const missingFields = [];
        if (!cardNumberComplete) missingFields.push('Card Number');
        if (!cardExpiryComplete) missingFields.push('Expiry');
        if (!cardCvcComplete) missingFields.push('CVV');

        alert(`Please complete all card fields:\n- ${missingFields.join('\n- ')}`);
        return;
      }

      setLoading(true);

      // Get the orderId and openOrder response that were stored when fields were initialized
      const orderId = (window as any).nuveiOrderId;
      const openOrderResponse = (window as any).nuveiOpenOrderResponse;

      if (!orderId || !openOrderResponse) {
        alert('Order session expired. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      setLogs((prev) => [...prev, `Using existing order: ${orderId}`]);
      setLogs((prev) => [...prev, `Session token: ${sessionToken.substring(0, 20)}...`]);

      // Step 1: Get card token from Nuvei Fields (already filled by user)
      try {
        setLogs((prev) => [...prev, '=== Step 1: Getting card token from Nuvei Fields (Frontend) ===']);

        // Get SafeCharge instance
        // @ts-ignore
        const sfc = (window as any).nuveiSfc;
        const nuveiFieldsData = (window as any).nuveiFields;

        if (!sfc || !nuveiFieldsData) {
          throw new Error('SafeCharge SDK not initialized');
        }

        setLogs((prev) => [...prev, 'Calling getToken() on card fields...']);

        const tokenResult = await sfc.getToken(nuveiFieldsData.cardNumber);

        console.log('Full getToken result:', tokenResult);
        setLogs((prev) => [...prev, `getToken result:`, tokenResult]);

        // Check if tokenization was successful
        if (!tokenResult || tokenResult.status !== 'SUCCESS') {
          let errorMsg = 'Failed to get card token';

          if (tokenResult) {
            if (tokenResult.errorDescription) {
              errorMsg = tokenResult.errorDescription;
            } else if (tokenResult.error) {
              errorMsg = typeof tokenResult.error === 'string' ? tokenResult.error : JSON.stringify(tokenResult.error);
            } else if (tokenResult.message) {
              errorMsg = tokenResult.message;
            } else if (tokenResult.reason) {
              errorMsg = tokenResult.reason;
            } else if (tokenResult.status) {
              errorMsg = `Tokenization failed with status: ${tokenResult.status}`;
            }
          }

          throw new Error(errorMsg);
        }

        if (!tokenResult.ccTempToken) {
          throw new Error('No ccTempToken received from Nuvei Fields');
        }

        const ccTempToken = tokenResult.ccTempToken;
        setLogs((prev) => [...prev, `✓ Card tokenized successfully: ${ccTempToken.substring(0, 20)}...`]);

        // Step 2: Call createPayment() from frontend using Web SDK
        setLogs((prev) => [...prev, '=== Step 2: Calling createPayment() (Frontend Web SDK) ===']);
        setLogs((prev) => [...prev, `Using sessionToken: ${sessionToken.substring(0, 20)}...`]);
        setLogs((prev) => [...prev, `Using orderId: ${orderId}`]);
        setLogs((prev) => [...prev, `Using ccTempToken: ${ccTempToken.substring(0, 20)}...`]);
        setLogs((prev) => [...prev, 'Calling sfc.createPayment()...']);

        const createPaymentPayload: any = {
          sessionToken: sessionToken, // From openOrder (called when flow was selected)
          merchantId: merchantId,
          merchantSiteId: merchantSiteId,
          clientUniqueId: `PAY_${Date.now()}`,
          paymentOption: {
            card: {
              ccTempToken: ccTempToken, // From Nuvei Fields getToken()
            },
          },
          billingAddress: {
            email: "test@example.com",
            country: "US",
          },
        };

        // Add card holder name (affects 3DS test scenarios)
        if (flowParams.cardHolderName) {
          createPaymentPayload.paymentOption.card.cardHolderName = flowParams.cardHolderName;
        }

        setLogs((prev) => [...prev, `createPayment payload:`, createPaymentPayload]);
        setLogs((prev) => [...prev, 'Note: Nuvei will display the 3DS challenge overlay automatically (no custom popup).']);

        const paymentResult: any = await new Promise((resolve, reject) => {
          // @ts-ignore
          sfc.createPayment(createPaymentPayload, function (result: any) {
            // Callback from SDK (will be called after 3DS challenge completes, if any)
            console.log('createPayment result:', result);

            // Log if 3DS was involved
            if (result.acsUrl || result.challengeRequired || result.challengeUrl || result.redirectUrl) {
              console.log('3DS challenge was presented');
              setLogs((prev) => [...prev, '3DS challenge presented via native Nuvei overlay.']);
            }
            resolve(result);
          });
        });

        setLogs((prev) => [...prev, `createPayment result:`, paymentResult]);
        setLogs((prev) => [...prev, '3DS authentication completed (if required)']);

        // Check if payment was successful
        if (paymentResult.cancelled === true) {
          throw new Error('Payment was cancelled by user');
        }

        if (paymentResult.result !== 'APPROVED' && paymentResult.transactionStatus !== 'APPROVED') {
          throw new Error(`Payment failed: ${paymentResult.transactionStatus || paymentResult.result || 'Unknown error'}`);
        }

        // Combine openOrder and createPayment responses
        const combinedResult = {
          flow: selectedFlow,
          status: 'SUCCESS',
          message: 'Credit card deposit completed successfully',
          methods: {
            openOrder: {
              method: 'openOrder()',
              request: {
                merchantId,
                merchantSiteId,
                amount: amount,
                currency: currency,
                userTokenId: flowParams.userTokenId || "SDKtest",
              },
              response: openOrderResponse.response || openOrderResponse,
            },
            createPayment: {
              method: 'createPayment()',
              request: {
                sessionToken: sessionToken.substring(0, 20) + '...',
                orderId,
                amount: amount,
                currency: currency,
                cardToken: ccTempToken.substring(0, 20) + '...',
                ...(flowParams.cardHolderName ? { cardHolderName: flowParams.cardHolderName } : {})
              },
              response: paymentResult,
            },
          },
          summary: {
            orderId,
            transactionId: paymentResult.transactionId,
            transactionStatus: paymentResult.transactionStatus,
            finalStatus: paymentResult.result || paymentResult.transactionStatus,
          },
        };

        setResponse(combinedResult);
        setLogs((prev) => [...prev, '=== Flow Completed Successfully ===']);
      } catch (error: any) {
        setLoading(false);
        const errorMsg = error?.message || 'Payment failed';
        setLogs((prev) => [...prev, `ERROR: ${errorMsg}`]);
        alert(`Payment failed:\n\n${errorMsg}\n\nCheck console logs for details.`);
        return;
      }

      setLoading(false);
      return; // Exit early for credit card deposit - we've handled it
    }

    // Special handling for APM deposit
    if (selectedFlow === "apmDeposit") {
      setLogs(['=== Starting APM Deposit Flow ===']);

      // Validate merchant credentials
      if (!merchantId || !merchantSiteId || !secretKey) {
        alert("Please fill in all merchant credentials");
        return;
      }

      // Validate amount and currency
      const amount = flowParams.amount || "100";
      const currency = flowParams.currency || "USD";
      if (!amount || !currency) {
        alert("Please fill in amount and currency fields");
        return;
      }

      // Validate APM selection
      if (!selectedApm) {
        alert("Please select a payment method");
        return;
      }

      // Get the selected APM object
      const selectedApmObj = availableApms.find((a: any) => a.paymentMethod === selectedApm);
      if (!selectedApmObj) {
        alert("Invalid payment method selected");
        return;
      }

      // Validate standard required fields
      const standardFields = ['firstName', 'lastName', 'email', 'country', 'ipAddress'];
      const missingStandardFields = standardFields.filter(
        field => !flowParams[field] || flowParams[field].trim() === ""
      );

      if (missingStandardFields.length > 0) {
        const fieldLabels: Record<string, string> = {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email',
          country: 'Country',
          ipAddress: 'IP Address'
        };
        alert(`Please fill in all required fields: ${missingStandardFields.map(f => fieldLabels[f]).join(", ")}`);
        return;
      }

      // Validate APM-specific fields
      if (selectedApmObj.fields && selectedApmObj.fields.length > 0) {
        const missingFields = selectedApmObj.fields.filter(
          (field: any) => field.mandatory && (!flowParams[field.name] || flowParams[field.name].trim() === "")
        );

        if (missingFields.length > 0) {
          const fieldCaptions = missingFields.map((f: any) => {
            const caption = typeof f.caption === 'object' ? f.caption?.message || f.name : f.caption || f.name;
            return caption;
          });
          alert(`Please fill in all required fields: ${fieldCaptions.join(", ")}`);
          return;
        }
      }

      setLoading(true);

      try {
        // Step 1: Call openOrder()
        setLogs((prev) => [...prev, '=== Step 1: Calling openOrder() ===']);

        const openOrderPayload: any = {
          merchantId,
          merchantSiteId,
          secretKey,
          amount,
          currency: "USD", // Always use USD for openOrder, will update via updateOrder if needed
          userTokenId: flowParams.userTokenId || "SDKtest",
          clientUniqueId: `APM_${Date.now()}`,
        };

        if (notificationUrl) {
          openOrderPayload.notificationUrl = notificationUrl;
        }

        setLogs((prev) => [...prev, `openOrder request: ${JSON.stringify(openOrderPayload, null, 2)}`]);

        const openOrderResponse = await fetch('/api/open-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(openOrderPayload),
        });

        const openOrderData = await openOrderResponse.json();
        setLogs((prev) => [...prev, `openOrder response: ${JSON.stringify(openOrderData, null, 2)}`]);

        if (!openOrderData.ok || !openOrderData.sessionToken) {
          throw new Error(openOrderData.error || 'Failed to open order');
        }

        const apmSessionToken = openOrderData.sessionToken;
        const orderId = openOrderData.orderId;

        // Step 1.5: Validate currency compatibility and update if needed
        const openOrderCurrency = "USD"; // openOrder always uses USD by default
        const selectedCurrency = currency; // Currency from the Currency field

        // Check if APM supports the selected currency
        if (selectedApmObj.currencies && selectedApmObj.currencies.length > 0) {
          const supportedCurrencies = selectedApmObj.currencies;
          setLogs((prev) => [...prev, `APM ${selectedApm} supports currencies: ${supportedCurrencies.join(', ')}`]);

          if (!supportedCurrencies.includes(selectedCurrency)) {
            const errorMsg = `Currency ${selectedCurrency} is not supported by ${selectedApm}. Supported currencies: ${supportedCurrencies.join(', ')}`;
            setLogs((prev) => [...prev, `ERROR: ${errorMsg}`]);
            throw new Error(errorMsg);
          }

          setLogs((prev) => [...prev, `✓ Currency ${selectedCurrency} is supported by this APM`]);
        }

        // Check if we need to update the order currency
        if (openOrderCurrency !== selectedCurrency) {
          setLogs((prev) => [...prev, `=== Step 1.5: Updating order currency ===`]);
          setLogs((prev) => [...prev, `openOrder currency: ${openOrderCurrency}, Selected currency: ${selectedCurrency}`]);
          setLogs((prev) => [...prev, `Calling updateOrder to change currency to ${selectedCurrency}...`]);

          const updateOrderPayload: any = {
            merchantId,
            merchantSiteId,
            secretKey,
            sessionToken: apmSessionToken,
            orderId,
            currency: selectedCurrency,
            amount,
            clientRequestId: `${Date.now()}`,
          };

          const updateOrderResponse = await fetch('/api/update-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateOrderPayload),
          });

          const updateOrderData = await updateOrderResponse.json();
          setLogs((prev) => [...prev, 'updateOrder response:', updateOrderData]);

          if (!updateOrderData.ok || updateOrderData.response?.status !== 'SUCCESS') {
            throw new Error(updateOrderData.error || updateOrderData.response?.reason || 'Failed to update order currency');
          }

          setLogs((prev) => [...prev, `✓ Order currency updated to ${selectedCurrency}`]);
        } else {
          setLogs((prev) => [...prev, `Currency already matches (${selectedCurrency}), no update needed`]);
        }

        setLogs((prev) => [...prev, '=== Step 2: Calling createPayment() with APM ===']);
        setLogs((prev) => [...prev, `Using sessionToken: ${apmSessionToken.substring(0, 20)}...`]);
        setLogs((prev) => [...prev, `Using orderId: ${orderId}`]);
        setLogs((prev) => [...prev, `Using APM: ${selectedApm}`]);

        // Build paymentOption with APM-specific fields
        const paymentOption: any = {
          alternativePaymentMethod: {
            paymentMethod: selectedApm,
          }
        };

        // Add APM-specific fields if they exist
        if (selectedApmObj.fields && selectedApmObj.fields.length > 0) {
          selectedApmObj.fields.forEach((field: any) => {
            if (flowParams[field.name]) {
              paymentOption.alternativePaymentMethod[field.name] = flowParams[field.name];
            }
          });
        }

        // Call createPayment via Web SDK (frontend)
        const createPaymentPayload: any = {
          sessionToken: apmSessionToken,
          merchantId,
          merchantSiteId,
          clientUniqueId: `APM_${Date.now()}`,
          paymentOption: paymentOption,
          billingAddress: {
            firstName: flowParams.firstName,
            lastName: flowParams.lastName,
            email: flowParams.email,
            country: flowParams.country,
          },
          userDetails: {
            firstName: flowParams.firstName,
            lastName: flowParams.lastName,
            email: flowParams.email,
            country: flowParams.country,
          },
          deviceDetails: {
            ipAddress: flowParams.ipAddress,
          },
          amount,
          currency: selectedCurrency, // Use the currency from APM or updateOrder
        };

        setLogs((prev) => [...prev, `createPayment payload: ${JSON.stringify(createPaymentPayload, null, 2)}`]);

        // Initialize SDK instance for API call
        const SafeCharge = (window as any).SafeCharge;
        if (typeof SafeCharge !== 'function') {
          throw new Error('Nuvei SDK not loaded');
        }

        const sfc = SafeCharge({
          env: 'test',
          merchantId,
          merchantSiteId,
          sessionToken: apmSessionToken,
        });
        if (!sfc || typeof sfc.createPayment !== 'function') {
          throw new Error('Nuvei SDK instance missing createPayment()');
        }

        const paymentResult: any = await new Promise((resolve, reject) => {
          // @ts-ignore
          sfc.createPayment(createPaymentPayload, function (result: any) {
            resolve(result);
          });
        });

        setLogs((prev) => [...prev, `createPayment result: ${JSON.stringify(paymentResult, null, 2)}`]);

        // Check if payment was successful or requires redirect
        if (paymentResult.cancelled === true) {
          throw new Error('Payment was cancelled by user');
        }

        // For APMs, we might get a redirect URL
        if (paymentResult.redirectUrl) {
          setLogs((prev) => [...prev, `APM requires redirect to: ${paymentResult.redirectUrl}`]);
          setLogs((prev) => [...prev, 'Opening redirect URL in new window...']);
          window.open(paymentResult.redirectUrl, '_blank');
        }

        // Combine responses
        const combinedResult = {
          flow: selectedFlow,
          status: 'SUCCESS',
          message: 'APM deposit initiated successfully',
          methods: {
            openOrder: {
              method: 'openOrder()',
              request: {
                merchantId,
                merchantSiteId,
                amount,
                currency,
                userTokenId: flowParams.userTokenId || "SDKtest",
              },
              response: openOrderData.response || openOrderData,
            },
            createPayment: {
              method: 'createPayment()',
              request: {
                sessionToken: apmSessionToken.substring(0, 20) + '...',
                orderId,
                amount,
                currency,
                paymentMethod: selectedApm,
              },
              response: paymentResult,
            },
          },
          summary: {
            orderId,
            transactionId: paymentResult.transactionId,
            transactionStatus: paymentResult.transactionStatus || paymentResult.status,
            redirectUrl: paymentResult.redirectUrl,
          },
        };

        setResponse(combinedResult);
        setLogs((prev) => [...prev, '=== Flow Completed Successfully ===']);
      } catch (error: any) {
        setLoading(false);
        const errorMsg = error?.message || 'APM payment failed';
        setLogs((prev) => [...prev, `ERROR: ${errorMsg}`]);
        alert(`APM payment failed:\n\n${errorMsg}\n\nCheck console logs for details.`);
        return;
      }

      setLoading(false);
      return; // Exit early for APM deposit - we've handled it
    }

    // Validate required fields
    if (currentFlow) {
      const missingFields = currentFlow.requiredFields.filter(
        field => !flowParams[field.id] || flowParams[field.id].trim() === ""
      );

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`);
        return;
      }
    }

    // Validate merchant credentials
    if (!merchantId || !merchantSiteId || !secretKey) {
      alert("Please fill in all merchant credentials");
      return;
    }

    // Save cookies before running flow to ensure values are persisted
    saveToCookie("nuvei_merchantId", merchantId);
    saveToCookie("nuvei_merchantSiteId", merchantSiteId);
    saveToCookie("nuvei_secretKey", secretKey);

    setLoading(true);
    setLogs((prev) => [...prev, `Running flow: ${currentFlow?.name || selectedFlow}`]);
    setResponse(null);

    const res = await fetch("/api/run-flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        merchantSiteId,
        secretKey,
        flow: selectedFlow,
        flowParams,
        sessionToken: sessionToken
      })
    });

    const data = await res.json();
    setLoading(false);

    if (data.logs) {
      setLogs((prev) => [...prev, ...data.logs]);
    }

    setResponse(data);
  }

  const primaryPurple = "#614051";
  const darkPurple = "#4a3140";
  const lightPurple = "#7a5a6a";
  const bgLight = "#f5f5f5";
  const bgDark = "#1a1a1a";
  const textDark = "#1a1a1a";
  const textLight = "#666666";
  const borderColor = "#e0e0e0";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: nightMode ? bgDark : bgLight,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: nightMode ? "#252525" : textDark,
        color: "#ffffff",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#ffffff"
        }}>
          Nuvei SDK Console
        </h1>
        <button
          onClick={() => setNightMode(!nightMode)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          {nightMode ? "☀️ Light Mode" : "🌙 Night Mode"}
        </button>
      </header>

      <main style={{
        maxWidth: 1200,
        margin: "2rem auto",
        padding: "0 2rem"
      }}>

        {/* Credentials Card */}
        <div style={{
          backgroundColor: nightMode ? "#252525" : "#ffffff",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: nightMode ? "1px solid #333" : "1px solid " + borderColor
        }}>
          <h2 style={{
            color: nightMode ? "#ffffff" : textDark,
            fontSize: "1.25rem",
            fontWeight: 600,
            margin: "0 0 1.5rem 0"
          }}>
            Merchant Credentials
          </h2>

          <form style={{ display: "grid", gap: "1rem" }} onSubmit={(e) => e.preventDefault()}>
            <div>
              <label style={{
                display: "block",
                color: nightMode ? "#cccccc" : textLight,
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem"
              }}>
                Merchant ID
              </label>
              <input
                placeholder="Enter your merchant ID"
                name="merchantId"
                id="merchantId"
                autoComplete="organization"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid " + (nightMode ? "#444" : borderColor),
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                onBlur={(e) => {
                  handleMerchantIdBlur();
                  e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor;
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                color: nightMode ? "#cccccc" : textLight,
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem"
              }}>
                Merchant Site ID
              </label>
              <input
                placeholder="Enter your merchant site ID"
                name="merchantSiteId"
                id="merchantSiteId"
                autoComplete="organization-unit"
                value={merchantSiteId}
                onChange={(e) => setMerchantSiteId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid " + (nightMode ? "#444" : borderColor),
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                onBlur={(e) => {
                  handleMerchantSiteIdBlur();
                  e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor;
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                color: nightMode ? "#cccccc" : textLight,
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem"
              }}>
                Secret Key
              </label>
              <input
                placeholder="Enter your secret key"
                type="password"
                name="secretKey"
                id="secretKey"
                autoComplete="current-password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid " + (nightMode ? "#444" : borderColor),
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                onBlur={(e) => {
                  handleSecretKeyBlur();
                  e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor;
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                color: nightMode ? "#cccccc" : textLight,
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem"
              }}>
                Notification URL (Optional)
                <span style={{
                  marginLeft: "0.5rem",
                  fontWeight: 400,
                  fontSize: "0.8rem",
                  color: nightMode ? "#999" : "#666"
                }}>
                  - For DMN webhooks
                </span>
              </label>
              <input
                placeholder="https://webhook.site/your-unique-url"
                type="url"
                name="notificationUrl"
                id="notificationUrl"
                autoComplete="url"
                value={notificationUrl}
                onChange={(e) => setNotificationUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid " + (nightMode ? "#444" : borderColor),
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                onBlur={(e) => {
                  handleNotificationUrlBlur();
                  e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor;
                }}
              />
            </div>
          </form>
        </div>

        {/* Main Content Area */}
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid " + (nightMode ? "#444" : "#e0e0e0")
          }}>
            <button
              onClick={() => setActiveTab('flows')}
              style={{
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                borderBottom: activeTab === 'flows' ? `2px solid ${primaryPurple}` : "2px solid transparent",
                color: activeTab === 'flows' ? primaryPurple : (nightMode ? "#aaa" : textLight),
                fontWeight: activeTab === 'flows' ? 600 : 500,
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.2s"
              }}
            >
              SDK Flows
            </button>
            <button
              onClick={() => setActiveTab('methods')}
              style={{
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                borderBottom: activeTab === 'methods' ? `2px solid ${primaryPurple}` : "2px solid transparent",
                color: activeTab === 'methods' ? primaryPurple : (nightMode ? "#aaa" : textLight),
                fontWeight: activeTab === 'methods' ? 600 : 500,
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.2s"
              }}
            >
              SDK Methods
            </button>
          </div>

          <p style={{
            marginTop: "0.5rem",
            color: nightMode ? "#aaaaaa" : textLight,
            fontSize: "0.8125rem",
            fontStyle: "italic"
          }}>
            {currentFlow?.description}
          </p>
        </div>

        {/* SDK Flows Section */}
        {activeTab === 'flows' && (
          <div style={{
            backgroundColor: nightMode ? "#252525" : "#ffffff",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: nightMode ? "1px solid #333" : "1px solid " + borderColor
          }}>
            <h2 style={{
              color: nightMode ? "#ffffff" : textDark,
              fontSize: "1.25rem",
              fontWeight: 600,
              margin: "0 0 1.5rem 0"
            }}>
              SDK Flows
            </h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                color: nightMode ? "#cccccc" : textLight,
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem"
              }}>
                Select Flow
              </label>
              <select
                value={selectedFlow}
                onChange={(e) => handleFlowChange(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid " + (nightMode ? "#444" : borderColor),
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "0.9375rem",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
              >
                <option value="">-- Choose a payment flow --</option>
                {FLOWS.map(flow => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
              <p style={{
                marginTop: "0.5rem",
                color: nightMode ? "#aaaaaa" : textLight,
                fontSize: "0.8125rem",
                fontStyle: "italic"
              }}>
                {currentFlow?.description}
              </p>
            </div>

            {/* Dynamic Flow Parameters */}
            {selectedFlow === "creditCardDeposit" && (
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ display: "block", color: nightMode ? "#dddddd" : textDark, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Quick scenarios
                </span>
                <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        handleFlowParamChange("amount", "150");
                        handleFlowParamChange("cardHolderName", "FL-BRW1");
                        setLogs((prev) => [...prev, 'Loaded Frictionless preset (Amount 150, Card Holder FL-BRW1)']);
                      }}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid " + primaryPurple,
                        backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                        color: primaryPurple,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#f0edf6";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = nightMode ? "#2a2a2a" : "#ffffff";
                      }}
                    >
                      Frictionless
                    </button>
                    <p style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: nightMode ? "#bbbbbb" : textLight }}>
                      card - 4000020951595032
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        handleFlowParamChange("amount", "151");
                        handleFlowParamChange("cardHolderName", "CL-BRW2");
                        setLogs((prev) => [...prev, 'Loaded Challenge preset (Amount 151, Card Holder CL-BRW2)']);
                      }}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid " + primaryPurple,
                        backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                        color: primaryPurple,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#f0edf6";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = nightMode ? "#2a2a2a" : "#ffffff";
                      }}
                    >
                      Challenge
                    </button>
                    <p style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: nightMode ? "#bbbbbb" : textLight }}>
                      card - 2221008123677736
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentFlow && currentFlow.requiredFields.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "1rem",
                  fontWeight: 600,
                  margin: "0 0 1rem 0"
                }}>
                  Required Parameters
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {currentFlow.requiredFields.map(field => (
                    <div key={field.id}>
                      <label style={{
                        display: "block",
                        color: nightMode ? "#cccccc" : textLight,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem"
                      }}>
                        {field.label} <span style={{ color: primaryPurple }}>*</span>
                      </label>
                      {field.type === "select" && field.id === "currency" ? (
                        <select
                          value={flowParams.currency || "USD"}
                          onChange={(e) => handleFlowParamChange(field.id, e.target.value)}
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid " + (nightMode ? "#444" : borderColor),
                            borderRadius: "8px",
                            backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                            color: nightMode ? "#ffffff" : textDark,
                            fontSize: "0.9375rem",
                            outline: "none",
                            cursor: "pointer",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                          onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                        >
                          {CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code}>
                              {curr.code} - {curr.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={(() => {
                            if (field.id === "amount") {
                              return flowParams.amount || "100";
                            }
                            if (field.id === "userTokenId") {
                              return flowParams.userTokenId || "SDKtest";
                            }
                            if (field.id === "cardHolderName") {
                              return flowParams.cardHolderName || "Lee Gariny";
                            }
                            return flowParams[field.id] || "";
                          })()}
                          onChange={(e) => handleFlowParamChange(field.id, e.target.value)}
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid " + (nightMode ? "#444" : borderColor),
                            borderRadius: "8px",
                            backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                            color: nightMode ? "#ffffff" : textDark,
                            fontSize: "0.9375rem",
                            outline: "none",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                          onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APM Selection for APM Deposit */}
            {selectedFlow === "apmDeposit" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "1rem",
                  fontWeight: 600,
                  margin: "0 0 1rem 0"
                }}>
                  Select Payment Method
                </h3>

                {availableApms.length === 0 && (
                  <p style={{
                    color: textLight,
                    fontSize: "0.875rem",
                    marginBottom: "1rem"
                  }}>
                    Loading available payment methods...
                  </p>
                )}

                {availableApms.length > 0 && (
                  <div>
                    <label style={{
                      display: "block",
                      color: nightMode ? "#cccccc" : textLight,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem"
                    }}>
                      Available Payment Methods <span style={{ color: primaryPurple }}>*</span>
                    </label>
                    <select
                      value={selectedApm}
                      onChange={(e) => setSelectedApm(e.target.value)}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid " + (nightMode ? "#444" : borderColor),
                        borderRadius: "8px",
                        backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                        color: nightMode ? "#ffffff" : textDark,
                        fontSize: "0.9375rem",
                        outline: "none",
                        cursor: "pointer",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                      onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                    >
                      <option value="">-- Select a payment method --</option>
                      {availableApms.map((apm: any) => {
                        const displayName = typeof apm.paymentMethodDisplayName === 'object'
                          ? apm.paymentMethodDisplayName?.message || apm.paymentMethod
                          : apm.paymentMethodDisplayName || apm.paymentMethod;
                        return (
                          <option key={apm.paymentMethod} value={apm.paymentMethod}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>

                    {selectedApm && (
                      <div style={{ marginTop: "1.5rem" }}>
                        <p style={{
                          color: nightMode ? "#aaaaaa" : textLight,
                          fontSize: "0.8125rem",
                          fontStyle: "italic",
                          marginBottom: "1rem"
                        }}>
                          Selected: {(() => {
                            const apm = availableApms.find((a: any) => a.paymentMethod === selectedApm);
                            if (!apm) return selectedApm;
                            const displayName = typeof apm.paymentMethodDisplayName === 'object'
                              ? apm.paymentMethodDisplayName?.message || apm.paymentMethod
                              : apm.paymentMethodDisplayName || apm.paymentMethod;
                            return displayName;
                          })()}
                        </p>

                        {/* Dynamic APM Fields */}
                        {(() => {
                          const apm = availableApms.find((a: any) => a.paymentMethod === selectedApm);

                          return (
                            <div style={{ display: "grid", gap: "1rem" }}>
                              <h4 style={{
                                color: nightMode ? "#ffffff" : textDark,
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                margin: "0 0 0.5rem 0"
                              }}>
                                Payment Details
                              </h4>

                              {/* Amount field - always required */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  Amount <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="100"
                                  value={flowParams.amount || "100"}
                                  onChange={(e) => handleFlowParamChange("amount", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* Currency field - filtered by APM support */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  Currency <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <select
                                  value={flowParams.currency || "USD"}
                                  onChange={(e) => handleFlowParamChange("currency", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    cursor: "pointer",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                >
                                  {(() => {
                                    if (!apm) return null;

                                    // Get supported currencies from:
                                    // 1. Hardcoded mapping (most reliable)
                                    // 2. API response (if available)
                                    // 3. All currencies (fallback)
                                    let supportedCurrencyCodes: string[] = [];

                                    // Check hardcoded mapping first
                                    if (APM_CURRENCIES[apm.paymentMethod]) {
                                      supportedCurrencyCodes = APM_CURRENCIES[apm.paymentMethod];
                                      console.log(`Using hardcoded currencies for ${apm.paymentMethod}:`, supportedCurrencyCodes);
                                    }
                                    // Try API response
                                    else if (apm.currencies && Array.isArray(apm.currencies) && apm.currencies.length > 0) {
                                      supportedCurrencyCodes = apm.currencies;
                                      console.log(`Using API currencies for ${apm.paymentMethod}:`, supportedCurrencyCodes);
                                    }
                                    // Fallback to all currencies
                                    else {
                                      supportedCurrencyCodes = CURRENCIES.map(c => c.code);
                                      console.log(`Using all currencies for ${apm.paymentMethod} (no restrictions found)`);
                                    }

                                    const availableCurrencies = CURRENCIES.filter(curr =>
                                      supportedCurrencyCodes.includes(curr.code)
                                    );

                                    return availableCurrencies.map(curr => (
                                      <option key={curr.code} value={curr.code}>
                                        {curr.code} - {curr.name}
                                      </option>
                                    ));
                                  })()}
                                </select>
                              </div>

                              {/* Standard Required Fields - Always shown for all APMs */}
                              <h4 style={{
                                color: nightMode ? "#ffffff" : textDark,
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                margin: "1rem 0 0.5rem 0"
                              }}>
                                Customer Information
                              </h4>

                              {/* First Name */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  First Name <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="John"
                                  value={flowParams.firstName || ""}
                                  onChange={(e) => handleFlowParamChange("firstName", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* Last Name */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  Last Name <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Doe"
                                  value={flowParams.lastName || ""}
                                  onChange={(e) => handleFlowParamChange("lastName", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* Email */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  Email <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="email"
                                  placeholder="john.doe@example.com"
                                  value={flowParams.email || ""}
                                  onChange={(e) => handleFlowParamChange("email", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* Country */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  Country <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="US (2-letter country code)"
                                  value={flowParams.country || ""}
                                  onChange={(e) => handleFlowParamChange("country", e.target.value)}
                                  disabled={loading}
                                  maxLength={2}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* IP Address */}
                              <div>
                                <label style={{
                                  display: "block",
                                  color: nightMode ? "#cccccc" : textLight,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  marginBottom: "0.5rem"
                                }}>
                                  IP Address <span style={{ color: primaryPurple }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="192.168.1.1"
                                  value={flowParams.ipAddress || ""}
                                  onChange={(e) => handleFlowParamChange("ipAddress", e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                                    borderRadius: "8px",
                                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                />
                              </div>

                              {/* APM-specific fields */}
                              {apm && apm.fields && apm.fields.length > 0 && (
                                <>
                                  <h4 style={{
                                    color: nightMode ? "#ffffff" : textDark,
                                    fontSize: "0.9375rem",
                                    fontWeight: 600,
                                    margin: "1rem 0 0.5rem 0"
                                  }}>
                                    {typeof apm.paymentMethodDisplayName === 'object'
                                      ? apm.paymentMethodDisplayName?.message || apm.paymentMethod
                                      : apm.paymentMethodDisplayName || apm.paymentMethod} Specific Fields
                                  </h4>
                                  {apm.fields.map((field: any) => {
                                    // Extract field caption (handle object format)
                                    const fieldCaption = typeof field.caption === 'object'
                                      ? field.caption?.message || field.name
                                      : field.caption || field.name;

                                    return (
                                      <div key={field.name}>
                                        <label style={{
                                          display: "block",
                                          color: nightMode ? "#cccccc" : textLight,
                                          fontSize: "0.875rem",
                                          fontWeight: 500,
                                          marginBottom: "0.5rem"
                                        }}>
                                          {fieldCaption} {field.mandatory && <span style={{ color: primaryPurple }}>*</span>}
                                        </label>
                                        {field.type === 'select' && field.validValues ? (
                                          <select
                                            value={flowParams[field.name] || ""}
                                            onChange={(e) => handleFlowParamChange(field.name, e.target.value)}
                                            disabled={loading}
                                            style={{
                                              width: "100%",
                                              padding: "0.75rem",
                                              border: "1px solid " + (nightMode ? "#444" : borderColor),
                                              borderRadius: "8px",
                                              backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                              color: nightMode ? "#ffffff" : textDark,
                                              fontSize: "0.9375rem",
                                              outline: "none",
                                              cursor: "pointer",
                                              transition: "border-color 0.2s"
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                            onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                          >
                                            <option value="">-- Select --</option>
                                            {field.validValues.map((val: string) => (
                                              <option key={val} value={val}>{val}</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            type={field.type || "text"}
                                            placeholder={fieldCaption}
                                            value={flowParams[field.name] || ""}
                                            onChange={(e) => handleFlowParamChange(field.name, e.target.value)}
                                            disabled={loading}
                                            style={{
                                              width: "100%",
                                              padding: "0.75rem",
                                              border: "1px solid " + (nightMode ? "#444" : borderColor),
                                              borderRadius: "8px",
                                              backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                              color: nightMode ? "#ffffff" : textDark,
                                              fontSize: "0.9375rem",
                                              outline: "none",
                                              transition: "border-color 0.2s"
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                                            onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nuvei Fields for Credit Card Deposit */}
            {selectedFlow === "creditCardDeposit" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  color: nightMode ? "#ffffff" : textDark,
                  fontSize: "1rem",
                  fontWeight: 600,
                  margin: "0 0 1rem 0"
                }}>
                  Credit Card Details (Secure Nuvei Fields)
                  <span style={{
                    color: primaryPurple,
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    marginLeft: "0.5rem"
                  }}>
                    - 3D Secure Enabled
                  </span>
                </h3>
                {!sessionToken && (
                  <p style={{
                    color: "#ff6b6b",
                    fontSize: "0.875rem",
                    marginBottom: "1rem"
                  }}>
                    Please fill in merchant credentials and wait for session initialization...
                  </p>
                )}
                {sessionToken && !nuveiFieldsReady && !nuveiInitError && (
                  <p style={{
                    color: textLight,
                    fontSize: "0.875rem",
                    marginBottom: "1rem"
                  }}>
                    {!nuveiSdkLoaded ? "Loading Nuvei Web SDK..." : "Initializing secure card fields..."}
                  </p>
                )}
                {nuveiInitError && (
                  <p style={{
                    color: "#ff6b6b",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    backgroundColor: nightMode ? "#3a1a1a" : "#fff5f5",
                    borderRadius: "6px",
                    border: "1px solid #ff6b6b"
                  }}>
                    ⚠️ {nuveiInitError}
                  </p>
                )}
                {nuveiFieldsReady && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{
                      color: "#4ade80",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem"
                    }}>
                      ✓ Secure card fields ready
                    </p>
                    <div style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.8125rem",
                      color: nightMode ? "#aaaaaa" : textLight
                    }}>
                      <span style={{ color: cardNumberComplete ? "#4ade80" : "#ff6b6b" }}>
                        {cardNumberComplete ? "✓" : "○"} Card Number
                      </span>
                      <span style={{ color: cardExpiryComplete ? "#4ade80" : "#ff6b6b" }}>
                        {cardExpiryComplete ? "✓" : "○"} Expiry
                      </span>
                      <span style={{ color: cardCvcComplete ? "#4ade80" : "#ff6b6b" }}>
                        {cardCvcComplete ? "✓" : "○"} CVV
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: nightMode ? "#cccccc" : textLight,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem"
                    }}>
                      <span>Card Number</span>
                      <span style={{ color: primaryPurple }}>*</span>
                      {cardNumberComplete && <span style={{ color: "#4ade80" }}>✓</span>}
                    </label>
                    <div
                      id="nuvei-card-number"
                      style={{
                        padding: "0.75rem",
                        border: "1px solid " + (cardNumberComplete ? "#4ade80" : (nightMode ? "#444" : borderColor)),
                        borderRadius: "8px",
                        backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                        minHeight: "48px"
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: nightMode ? "#cccccc" : textLight,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem"
                      }}>
                        <span>Expiry</span>
                        <span style={{ color: primaryPurple }}>*</span>
                        {cardExpiryComplete && <span style={{ color: "#4ade80" }}>✓</span>}
                      </label>
                      <div
                        id="nuvei-card-expiry"
                        style={{
                          padding: "0.75rem",
                          border: "1px solid " + (cardExpiryComplete ? "#4ade80" : (nightMode ? "#444" : borderColor)),
                          borderRadius: "8px",
                          backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                          minHeight: "48px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: nightMode ? "#cccccc" : textLight,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem"
                      }}>
                        <span>CVV</span>
                        <span style={{ color: primaryPurple }}>*</span>
                        {cardCvcComplete && <span style={{ color: "#4ade80" }}>✓</span>}
                      </label>
                      <div
                        id="nuvei-card-cvv"
                        style={{
                          padding: "0.75rem",
                          border: "1px solid " + (cardCvcComplete ? "#4ade80" : (nightMode ? "#444" : borderColor)),
                          borderRadius: "8px",
                          backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                          minHeight: "48px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Run Flow Button */}
            <button
              onClick={handleRunFlow}
              disabled={loading || !selectedFlow}
              style={{
                padding: "0.875rem 2rem",
                backgroundColor: loading || !selectedFlow ? "#cccccc" : primaryPurple,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading || !selectedFlow ? "not-allowed" : "pointer",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "all 0.2s",
                boxShadow: loading || !selectedFlow ? "none" : "0 2px 4px rgba(97, 64, 81, 0.3)",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedFlow) {
                  e.currentTarget.style.backgroundColor = darkPurple;
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(97, 64, 81, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedFlow) {
                  e.currentTarget.style.backgroundColor = primaryPurple;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(97, 64, 81, 0.3)";
                }
              }}
            >
              {loading ? "Running Flow..." : "Run Flow"}
            </button>
          </div>
        )
        }

        {/* SDK Methods Section */}
        {
          activeTab === 'methods' && (
            <div style={{
              backgroundColor: nightMode ? "#252525" : "#ffffff",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: nightMode ? "1px solid #333" : "1px solid " + borderColor
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{
                    color: nightMode ? "#ffffff" : textDark,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    margin: 0
                  }}>
                    SDK Methods
                  </h2>
                  <p style={{
                    color: nightMode ? "#aaaaaa" : textLight,
                    fontSize: "0.875rem",
                    marginTop: "0.35rem"
                  }}>
                    Call SafeCharge helper methods directly from the browser. All methods run client-side using your credentials.
                  </p>
                  {sdkInstanceError && (
                    <p style={{
                      color: "#f87171",
                      fontSize: "0.8125rem",
                      marginTop: "0.35rem"
                    }}>
                      ⚠️ {sdkInstanceError}
                    </p>
                  )}
                </div>
                <div style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: nightMode ? "rgba(97,64,81,0.2)" : "rgba(97,64,81,0.1)",
                  color: primaryPurple
                }}>
                  Frontend only
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: nightMode ? "#cccccc" : textLight,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem"
                }}>
                  Select Method
                </label>
                <select
                  value={selectedSdkMethod}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  disabled={sdkMethodLoading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid " + (nightMode ? "#444" : borderColor),
                    borderRadius: "8px",
                    backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                    color: nightMode ? "#ffffff" : textDark,
                    fontSize: "0.9375rem",
                    outline: "none",
                    cursor: sdkMethodLoading ? "not-allowed" : "pointer",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                  onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
                >
                  <option value="">-- Choose an SDK method --</option>
                  {SDK_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                {currentMethod && (
                  <p style={{
                    marginTop: "0.5rem",
                    color: nightMode ? "#aaaaaa" : textLight,
                    fontSize: "0.8125rem",
                    fontStyle: "italic"
                  }}>
                    {currentMethod.description}
                  </p>
                )}
              </div>

              {currentMethod && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    color: nightMode ? "#ffffff" : textDark,
                    fontSize: "1rem",
                    fontWeight: 600,
                    margin: "0 0 1rem 0"
                  }}>
                    Method Parameters
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {currentMethod.params.map((param) => {
                      // Hide sessionToken field from UI as it's handled automatically
                      if (param.id === 'sessionToken') return null;

                      const valid = methodFieldIsValid(param);
                      return (
                        <div key={param.id} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <label style={{
                              color: nightMode ? "#cccccc" : textLight,
                              fontSize: "0.875rem",
                              fontWeight: 500
                            }}>
                              {param.label}
                              {param.required && <span style={{ color: primaryPurple, marginLeft: "0.25rem" }}>*</span>}
                            </label>
                            <span style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: valid ? "#4ade80" : "#f87171"
                            }} />
                          </div>
                          {param.type === "textarea" ? (
                            <textarea
                              placeholder={param.placeholder}
                              value={sdkMethodParams[param.id] || ""}
                              onChange={(e) => handleMethodParamChange(param.id, e.target.value)}
                              disabled={sdkMethodLoading}
                              rows={4}
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid " + (valid ? "#4ade80" : (nightMode ? "#444" : borderColor)),
                                borderRadius: "8px",
                                backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                color: nightMode ? "#ffffff" : textDark,
                                fontSize: "0.9375rem",
                                outline: "none",
                                transition: "border-color 0.2s",
                                resize: "vertical"
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                              onBlur={(e) => e.currentTarget.style.borderColor = valid ? "#4ade80" : (nightMode ? "#444" : borderColor)}
                            />
                          ) : (
                            <input
                              type={param.type}
                              placeholder={param.placeholder}
                              value={sdkMethodParams[param.id] || ""}
                              onChange={(e) => handleMethodParamChange(param.id, e.target.value)}
                              disabled={sdkMethodLoading}
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid " + (valid ? "#4ade80" : (nightMode ? "#444" : borderColor)),
                                borderRadius: "8px",
                                backgroundColor: nightMode ? "#2a2a2a" : "#ffffff",
                                color: nightMode ? "#ffffff" : textDark,
                                fontSize: "0.9375rem",
                                outline: "none",
                                transition: "border-color 0.2s"
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
                              onBlur={(e) => e.currentTarget.style.borderColor = valid ? "#4ade80" : (nightMode ? "#444" : borderColor)}
                            />
                          )}
                          {param.helperText && (
                            <span style={{ color: nightMode ? "#888888" : textLight, fontSize: "0.75rem" }}>
                              {param.helperText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentMethod && sdkMethodNeedsSessionToken && (
                <div style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: nightMode ? "rgba(97,64,81,0.2)" : "rgba(97,64,81,0.08)",
                  border: `1px solid ${nightMode ? "#4d3c43" : "#e0d1d8"}`,
                  color: nightMode ? "#f5e7ee" : textDark,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontWeight: 600 }}>
                    {sdkSessionPending ? "Preparing session token via openOrder..." : sessionToken ? `Session token ready (${sessionToken.substring(0, 12)}...)` : "Session token required"}
                  </span>
                  {!sessionToken && !sdkSessionPending && (
                    <span style={{ fontWeight: 400 }}>
                      {sdkSessionStatus || "Enter merchant credentials to auto-generate a token before running methods."}
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={runSdkMethod}
                disabled={
                  sdkSessionPending ||
                  sdkMethodLoading ||
                  !selectedSdkMethod ||
                  !isSdkMethodFormValid()
                }
                style={{
                  padding: "0.875rem 2rem",
                  backgroundColor: (sdkSessionPending || sdkMethodLoading || !selectedSdkMethod || !isSdkMethodFormValid()) ? "#cccccc" : lightPurple,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: (sdkSessionPending || sdkMethodLoading || !selectedSdkMethod || !isSdkMethodFormValid()) ? "not-allowed" : "pointer",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  if (!sdkSessionPending && !sdkMethodLoading && selectedSdkMethod && isSdkMethodFormValid()) {
                    e.currentTarget.style.backgroundColor = darkPurple;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sdkSessionPending && !sdkMethodLoading && selectedSdkMethod && isSdkMethodFormValid()) {
                    e.currentTarget.style.backgroundColor = lightPurple;
                  }
                }}
              >
                {sdkSessionPending
                  ? "Preparing Session..."
                  : sdkMethodLoading
                    ? "Running Method..."
                    : "Run SDK Method"}
              </button>
            </div>
          )
        }

        {/* Results Section - Stacked Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Logs Card */}
          <div style={{
            backgroundColor: nightMode ? "#252525" : "#ffffff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: nightMode ? "1px solid #333" : "1px solid " + borderColor
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{
                color: nightMode ? "#ffffff" : textDark,
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: 0
              }}>
                Console Logs
              </h2>
              <ThemeSelector
                currentTheme={consoleTheme}
                onThemeChange={setConsoleTheme}
                nightMode={nightMode}
              />
            </div>
            <pre style={{
              background: THEMES[consoleTheme]?.background || (nightMode ? "#0a0a0a" : "#1a1a1a"),
              color: THEMES[consoleTheme]?.text || "#4ade80",
              padding: "1rem",
              minHeight: "300px",
              maxHeight: "500px",
              borderRadius: "8px",
              overflow: "auto",
              border: THEMES[consoleTheme]?.border ? `1px solid ${THEMES[consoleTheme].border}` : (nightMode ? "1px solid #444" : "1px solid #e0e0e0"),
              margin: 0,
              fontSize: "0.8125rem",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              lineHeight: "1.5"
            }}>
              {logs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {logs.map((log, index) => (
                    <div key={index} style={{ wordBreak: 'break-word' }}>
                      {typeof log === 'string' ? (
                        <span>{log}</span>
                      ) : (
                        <CollapsibleJson
                          data={log}
                          nightMode={nightMode}
                          themeName={consoleTheme}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                "No logs yet. Run a flow to see output here."
              )}
            </pre>
          </div>

          {/* Response Card */}
          <div style={{
            backgroundColor: nightMode ? "#252525" : "#ffffff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: nightMode ? "1px solid #333" : "1px solid " + borderColor
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{
                color: nightMode ? "#ffffff" : textDark,
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: 0
              }}>
                API Response
              </h2>
              <ThemeSelector
                currentTheme={apiResponseTheme}
                onThemeChange={setApiResponseTheme}
                nightMode={nightMode}
              />
            </div>
            <div style={{
              background: THEMES[apiResponseTheme]?.background || (nightMode ? "#2a2a2a" : "#f8f8f8"),
              padding: "1rem",
              minHeight: "300px",
              maxHeight: "500px",
              borderRadius: "8px",
              overflow: "auto",
              border: THEMES[apiResponseTheme]?.border ? `1px solid ${THEMES[apiResponseTheme].border}` : (nightMode ? "1px solid #444" : "1px solid #e0e0e0"),
              margin: 0
            }}>
              {response && response.methods ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {Object.entries(response.methods).map(([methodKey, methodData]: [string, any]) => (
                    <div key={methodKey} style={{
                      border: "1px solid " + (nightMode ? "#555" : "#ddd"),
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: nightMode ? "#1f1f1f" : "#ffffff"
                    }}>
                      <h4 style={{
                        color: primaryPurple,
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        margin: "0 0 0.75rem 0",
                        paddingBottom: "0.5rem",
                        borderBottom: "2px solid " + primaryPurple
                      }}>
                        {methodData.method}
                      </h4>
                      <div style={{ marginTop: "0.75rem" }}>
                        <div style={{
                          color: nightMode ? "#cccccc" : textLight,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Response:
                        </div>
                        <div style={{
                          background: THEMES[apiResponseTheme]?.background || (nightMode ? "#0a0a0a" : "#f8f8f8"),
                          color: THEMES[apiResponseTheme]?.text || (nightMode ? "#e0e0e0" : textDark),
                          padding: "0.75rem",
                          borderRadius: "6px",
                          margin: 0,
                          fontSize: "0.75rem",
                          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                          lineHeight: "1.5",
                          overflow: "auto"
                        }}>
                          <CollapsibleJson data={methodData.response} nightMode={nightMode} themeName={apiResponseTheme} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {response.summary && (
                    <div style={{
                      border: "1px solid " + primaryPurple,
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: nightMode ? "#2a1a25" : "#fef7ff"
                    }}>
                      <h4 style={{
                        color: primaryPurple,
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        margin: "0 0 0.75rem 0"
                      }}>
                        Summary
                      </h4>
                      <div style={{
                        background: "transparent",
                        color: THEMES[apiResponseTheme]?.text || (nightMode ? "#e0e0e0" : textDark),
                        padding: 0,
                        margin: 0,
                        fontSize: "0.8125rem",
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        lineHeight: "1.5"
                      }}>
                        <CollapsibleJson data={response.summary} nightMode={nightMode} themeName={apiResponseTheme} />
                      </div>
                    </div>
                  )}
                </div>
              ) : response ? (
                <div style={{
                  color: THEMES[apiResponseTheme]?.text || (nightMode ? "#e0e0e0" : textDark),
                  margin: 0,
                  fontSize: "0.8125rem",
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  lineHeight: "1.5"
                }}>
                  <CollapsibleJson data={response} nightMode={nightMode} themeName={apiResponseTheme} />
                </div>
              ) : (
                <span style={{ color: nightMode ? "#888" : textLight }}>
                  No response yet. Run a flow to see results here.
                </span>
              )}
            </div>
          </div>
        </div>
      </main >

    </div >
  );
}
