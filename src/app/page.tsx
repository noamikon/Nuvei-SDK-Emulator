"use client";

import React, { useState, useEffect, useRef } from "react";

type FlowName =
  | "creditCardDeposit"
  | "apmDeposit";

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
      { id: "cardHolderName", label: "Card Holder Name", type: "text", placeholder: "John Smith" }
    ]
  },
  {
    id: "apmDeposit",
    name: "APM Deposit",
    description: "Process a payment using Alternative Payment Methods",
    requiredFields: [] // No required fields initially - they appear after APM selection
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
    currency: "USD" // Default currency
  });
  const [response, setResponse] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
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
    
    if (savedMerchantId) setMerchantId(savedMerchantId);
    if (savedMerchantSiteId) setMerchantSiteId(savedMerchantSiteId);
    if (savedSecretKey) setSecretKey(savedSecretKey);
    if (savedNotificationUrl) setNotificationUrl(savedNotificationUrl);
    
    // Load all saved values with defaults
    setFlowParams(prev => ({
      ...prev,
      amount: savedAmount || "100",
      currency: savedCurrency || "USD",
      cardHolderName: savedCardHolderName || "",
      firstName: savedFirstName || "",
      lastName: savedLastName || "",
      email: savedEmail || "",
      country: savedCountry || "",
      ipAddress: savedIpAddress || ""
    }));
  }, []);

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
  // For simple credit card deposit, we call openOrder (not getSessionToken)
  // because the ccTempToken must use the SAME sessionToken as createPayment
  const initiateSession = React.useCallback(async () => {
    if (!merchantId || !merchantSiteId || !secretKey) {
      return;
    }

    // For openOrder, we also need amount and currency (use defaults if not set)
    const amount = flowParams.amount || "100";
    const currency = flowParams.currency || "USD";

    try {
      // For APM flow: use getSessionToken (lightweight, no order created yet)
      // For Credit Card flow: use openOrder (creates order upfront)
      if (selectedFlow === "apmDeposit") {
        console.log('Initiating session (getSessionToken) for APM flow');
        
        const res = await fetch("/api/init-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId,
            merchantSiteId,
            secretKey,
          })
        });

        const data = await res.json();
        if (data.ok && data.sessionToken) {
          setSessionToken(data.sessionToken);
          console.log('Session token obtained:', data.sessionToken.substring(0, 20) + '...');
        } else {
          console.error('getSessionToken failed:', data);
        }
      } else {
        // Credit Card flow
        console.log('Initiating session (openOrder) with:', { amount, currency });
        
        const res = await fetch("/api/open-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId,
            merchantSiteId,
            secretKey,
            amount,
            currency,
            notificationUrl: notificationUrl || undefined, // Optional DMN webhook URL
          })
        });

        const data = await res.json();
        if (data.ok && data.sessionToken) {
          setSessionToken(data.sessionToken);
          // Store orderId and full response for later use in createPayment
          (window as any).nuveiOrderId = data.orderId;
          (window as any).nuveiOpenOrderResponse = data;
          console.log('openOrder successful, orderId:', data.orderId, 'sessionToken:', data.sessionToken.substring(0, 20) + '...');
        } else {
          console.error('openOrder failed:', data);
        }
      }
    } catch (error) {
      console.error("Error initiating session:", error);
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
  // NOTE: APM deposit needs session token for getApms() but doesn't call openOrder until "Run Flow"
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
            sfc.getApms(payload, function(result: any) {
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
            console.log('Available APMs with full data:', JSON.stringify(sortedApms, null, 2));
          } else {
            throw new Error('No payment methods returned from getApms()');
          }
        } catch (error: any) {
          console.error('Error fetching APMs via SDK:', error);
          setLogs(prev => [...prev, `ERROR with SDK: ${error.message}`]);
          
          // Fallback to backend API
          console.log('Falling back to backend API...');
          setLogs(prev => [...prev, 'Using backend API fallback...']);
          try {
            const response = await fetch('/api/get-apms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchantId,
                merchantSiteId,
                secretKey,
                sessionToken,
                currencyCode: flowParams.currency || "USD",
              }),
            });

            const data = await response.json();
            if (data.ok && data.apms) {
              const sortedApms = data.apms.sort((a: any, b: any) => {
                const nameA = typeof a.paymentMethodDisplayName === 'object' 
                  ? a.paymentMethodDisplayName?.message || a.paymentMethod 
                  : a.paymentMethodDisplayName || a.paymentMethod;
                const nameB = typeof b.paymentMethodDisplayName === 'object' 
                  ? b.paymentMethodDisplayName?.message || b.paymentMethod 
                  : b.paymentMethodDisplayName || b.paymentMethod;
                return nameA.localeCompare(nameB);
              });
              
              setAvailableApms(sortedApms);
              setApmsFetched(true); // Mark as fetched even via fallback
              setLogs(prev => [...prev, `Found ${sortedApms.length} available payment methods (via backend API)`]);
              console.log('APMs fetched via backend:', sortedApms);
            }
          } catch (backendError) {
            console.error('Backend fallback also failed:', backendError);
            setLogs(prev => [...prev, 'ERROR: Failed to fetch APMs via backend as well']);
            setAvailableApms([]);
          }
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
      currency: "USD" // Keep default currency
    }); // Reset flow parameters when flow changes (but keep amount/currency defaults)
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

  // Handle flow parameter change
  const handleFlowParamChange = (fieldId: string, value: string) => {
    // Special handling for country code - always uppercase
    const finalValue = fieldId === 'country' ? value.toUpperCase() : value;
    
    setFlowParams(prev => ({
      ...prev,
      [fieldId]: finalValue
    }));
    
    // Save to cookies for persistence
    if (fieldId === 'amount') {
      saveToCookie('nuvei_amount', finalValue);
      // Reset session when amount changes (for credit card flow)
      if (selectedFlow === 'creditCardDeposit') {
        setSessionToken(null); // This will trigger openOrder with new amount
        setNuveiFieldsReady(false);
      }
    } else if (fieldId === 'currency') {
      saveToCookie('nuvei_currency', finalValue);
      // Reset session when currency changes (for credit card flow)
      if (selectedFlow === 'creditCardDeposit') {
        setSessionToken(null); // This will trigger openOrder with new currency
        setNuveiFieldsReady(false);
      }
    } else if (fieldId === 'cardHolderName') {
      saveToCookie('nuvei_cardHolderName', finalValue);
    } else if (fieldId === 'firstName') {
      saveToCookie('nuvei_firstName', finalValue);
    } else if (fieldId === 'lastName') {
      saveToCookie('nuvei_lastName', finalValue);
    } else if (fieldId === 'email') {
      saveToCookie('nuvei_email', finalValue);
    } else if (fieldId === 'country') {
      saveToCookie('nuvei_country', finalValue);
    } else if (fieldId === 'ipAddress') {
      saveToCookie('nuvei_ipAddress', finalValue);
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
        setLogs((prev) => [...prev, `getToken result: ${JSON.stringify(tokenResult, null, 2)}`]);

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

        setLogs((prev) => [...prev, `createPayment payload: ${JSON.stringify(createPaymentPayload, null, 2)}`]);
        setLogs((prev) => [...prev, 'Note: Nuvei will display the 3DS challenge overlay automatically (no custom popup).']);
        
        const paymentResult: any = await new Promise((resolve, reject) => {
          // @ts-ignore
          sfc.createPayment(createPaymentPayload, function(result: any) {
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

        setLogs((prev) => [...prev, `createPayment result: ${JSON.stringify(paymentResult, null, 2)}`]);
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
        setShowThreeDSOverlay(false); // Hide overlay on error
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
          currency,
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
          sfc.createPayment(createPaymentPayload, function(result: any) {
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
                onBlur={handleMerchantIdBlur}
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
                onBlur={handleMerchantSiteIdBlur}
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
                onBlur={handleSecretKeyBlur}
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
                onBlur={handleNotificationUrlBlur}
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

        {/* SDK Flows Card */}
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
          
          {/* Flow Selector Dropdown */}
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
                cursor: loading ? "not-allowed" : "pointer",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = primaryPurple}
              onBlur={(e) => e.currentTarget.style.borderColor = nightMode ? "#444" : borderColor}
            >
              <option value="">-- Select a flow --</option>
              {FLOWS.map(flow => (
                <option key={flow.id} value={flow.id}>
                  {flow.name}
                </option>
              ))}
            </select>
            {currentFlow && (
              <p style={{
                marginTop: "0.5rem",
                color: nightMode ? "#aaaaaa" : textLight,
                fontSize: "0.8125rem",
                fontStyle: "italic"
              }}>
                {currentFlow.description}
              </p>
            )}
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
                        value={flowParams[field.id] || "USD"}
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
                        value={flowParams[field.id] || (field.id === "amount" ? "100" : "")}
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
            <h2 style={{ 
              color: nightMode ? "#ffffff" : textDark,
              fontSize: "1.125rem",
              fontWeight: 600,
              margin: "0 0 1rem 0"
            }}>
              Console Logs
            </h2>
            <pre style={{ 
              background: nightMode ? "#0a0a0a" : "#1a1a1a", 
              color: "#4ade80", 
              padding: "1rem", 
              minHeight: "300px", 
              maxHeight: "500px",
              borderRadius: "8px", 
              overflow: "auto",
              border: "none",
              margin: 0,
              fontSize: "0.8125rem",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              lineHeight: "1.5"
            }}>
              {logs.length > 0 ? logs.join("\n") : "No logs yet. Run a flow to see output here."}
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
            <h2 style={{ 
              color: nightMode ? "#ffffff" : textDark,
              fontSize: "1.125rem",
              fontWeight: 600,
              margin: "0 0 1rem 0"
            }}>
              API Response
            </h2>
            <div style={{ 
              background: nightMode ? "#2a2a2a" : "#f8f8f8", 
              padding: "1rem", 
              minHeight: "300px",
              maxHeight: "500px",
              borderRadius: "8px", 
              overflow: "auto",
              border: "1px solid " + (nightMode ? "#444" : borderColor),
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
                        <pre style={{
                          background: nightMode ? "#0a0a0a" : "#f8f8f8",
                          color: nightMode ? "#e0e0e0" : textDark,
                          padding: "0.75rem",
                          borderRadius: "6px",
                          margin: 0,
                          fontSize: "0.75rem",
                          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                          lineHeight: "1.5",
                          overflow: "auto"
                        }}>
                          {JSON.stringify(methodData.response, null, 2)}
                        </pre>
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
                      <pre style={{
                        background: "transparent",
                        color: nightMode ? "#e0e0e0" : textDark,
                        padding: 0,
                        margin: 0,
                        fontSize: "0.8125rem",
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        lineHeight: "1.5"
                      }}>
                        {JSON.stringify(response.summary, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : response ? (
                <pre style={{
                  color: nightMode ? "#e0e0e0" : textDark,
                  margin: 0,
                  fontSize: "0.8125rem",
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  lineHeight: "1.5"
                }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <span style={{ color: nightMode ? "#888" : textLight }}>
                  No response yet. Run a flow to see results here.
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
