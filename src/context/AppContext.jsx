'use client';

import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const INITIAL_LINKS = [
  {
    id: '8492',
    title: 'Shoe Haven Ghana - Leather Oxford Shoes',
    amount: 50.0,
    currency: 'USD',
    localAmount: 775.0,
    localCurrency: 'GHS',
    destination: 'MTN Mobile Money (+233 24 819 2041)',
    shortUrl: 'agilepay.me/x/8492',
    status: 'Active',
    views: 142,
    paymentsCount: 28,
    createdAt: '2026-10-18',
  },
  {
    id: '9120',
    title: 'SaaS Monthly Retainer - Growth Tier',
    amount: 150.0,
    currency: 'USD',
    localAmount: 2325.0,
    localCurrency: 'GHS',
    destination: 'Telecel Cash (+233 50 339 1042)',
    shortUrl: 'agilepay.me/x/9120',
    status: 'Active',
    views: 89,
    paymentsCount: 14,
    createdAt: '2026-10-19',
  },
  {
    id: '3044',
    title: 'Design Sprint Workshop Access',
    amount: 35.0,
    currency: 'USD',
    localAmount: 542.5,
    localCurrency: 'GHS',
    destination: 'Standard Chartered Bank (Account ****9102)',
    shortUrl: 'agilepay.me/x/3044',
    status: 'Active',
    views: 310,
    paymentsCount: 45,
    createdAt: '2026-10-20',
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_98418',
    customer: 'Kofi Mensah',
    email: 'kofi.mensah@gmail.com',
    date: 'Just now',
    amount: 50.0,
    currency: 'USD',
    localAmount: 775.0,
    localCurrency: 'GHS',
    channel: 'MoMo (MTN)',
    rail: 'Off-ramped via Lumx Base USDC',
    status: 'Paid - MoMo Sent',
    reference: 'AP-LMX-8172940',
  },
  {
    id: 'tx_98417',
    customer: 'Amara Okafor',
    email: 'amara.okafor@techhive.io',
    date: '24 mins ago',
    amount: 150.0,
    currency: 'USD',
    localAmount: 2325.0,
    localCurrency: 'GHS',
    channel: 'Card (Visa)',
    rail: 'Instant Settlement to Bank',
    status: 'Paid - MoMo Sent',
    reference: 'AP-CRD-391824',
  },
  {
    id: 'tx_98416',
    customer: 'David Osei-Tutu',
    email: 'david.osei@osei.co',
    date: '2 hours ago',
    amount: 80.0,
    currency: 'USD',
    localAmount: 1240.0,
    localCurrency: 'GHS',
    channel: 'USDC Rail',
    rail: 'Base Network Smart Settlement',
    status: 'Paid - MoMo Sent',
    reference: 'AP-CRY-192084',
  },
  {
    id: 'tx_98415',
    customer: 'Yaa Asantewaa',
    email: 'yaa.asantewaa@outlook.com',
    date: '5 hours ago',
    amount: 35.0,
    currency: 'USD',
    localAmount: 542.5,
    localCurrency: 'GHS',
    channel: 'MoMo (Telecel)',
    rail: 'Instant Settlement',
    status: 'Paid - MoMo Sent',
    reference: 'AP-LMX-109284',
  },
  {
    id: 'tx_98414',
    customer: 'Kwame Darko',
    email: 'kwame@ventures.africa',
    date: '1 day ago',
    amount: 220.0,
    currency: 'USD',
    localAmount: 3410.0,
    localCurrency: 'GHS',
    channel: 'Card (Mastercard)',
    rail: 'Standard settlement',
    status: 'Pending',
    reference: 'AP-CRD-771928',
  },
];

const INITIAL_API_KEYS = [
  {
    id: 'key_live_01',
    name: 'Production Server SDK',
    mode: 'live',
    prefix: 'pk_live_84f9a...',
    fullKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudF9pZCI6ImFnaWxlcGF5XzAxODIzIiwicm9sZSI6InByb2R1Y3Rpb24ifQ.xYs8_ProductionSecretLiveKey',
    created: '2026-09-12',
    lastUsed: '2 minutes ago',
  },
  {
    id: 'key_test_02',
    name: 'Local Dev & Staging Key',
    mode: 'sandbox',
    prefix: 'pk_test_31e8c...',
    fullKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudF9pZCI6InRlc3RfbWVyY2hhbnRfZGV2Iiwicm9sZSI6InNhbmRib3gifQ.dK99_SandboxTestSecretKey',
    created: '2026-10-01',
    lastUsed: 'Just now',
  },
];

const INITIAL_WEBHOOK_LOGS = [
  {
    id: 'wh_log_1',
    event: 'payment.success',
    statusCode: 200,
    statusText: '200 OK',
    timestamp: '2026-10-21 15:42:10 UTC',
    duration: '142ms',
    payload: {
      event: 'payment.success',
      data: {
        id: 'tx_98418',
        amount: 50.0,
        currency: 'USD',
        channel: 'momo_ghana_mtn',
        offramp_status: 'completed',
        beneficiary: '+233248192041',
        fee_collected: 0.5,
      },
    },
  },
  {
    id: 'wh_log_2',
    event: 'offramp.completed',
    statusCode: 200,
    statusText: '200 OK',
    timestamp: '2026-10-21 15:18:02 UTC',
    duration: '98ms',
    payload: {
      event: 'offramp.completed',
      data: {
        tx_hash: '0x3f4a9b2184019a...',
        usdc_amount: 150.0,
        fiat_disbursed: 2325.0,
        currency: 'GHS',
        destination_account: 'Standard Chartered',
      },
    },
  },
  {
    id: 'wh_log_3',
    event: 'customer.created',
    statusCode: 200,
    statusText: '200 OK',
    timestamp: '2026-10-21 13:05:44 UTC',
    duration: '112ms',
    payload: {
      event: 'customer.created',
      data: {
        customer_id: 'cust_gh_81920',
        name: 'David Osei-Tutu',
        phone: '+233540918231',
      },
    },
  },
];

export function AppProvider({ children }) {
  const [isSandbox, setIsSandbox] = useState(false);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [partnerFee, setPartnerFee] = useState({
    percentage: 1.0,
    partnerFeeId: 'pfee_agile_v2_984218',
  });
  const [webhookConfig, setWebhookConfig] = useState({
    url: 'https://api.shoenhaven.com/api/v1/agilepay-webhook',
    events: ['payment.success', 'offramp.completed', 'customer.created'],
    secret: 'whsec_90a82b417c8230f91a',
  });
  const [webhookLogs, setWebhookLogs] = useState(INITIAL_WEBHOOK_LOGS);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const createPaymentLink = (newLinkData) => {
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    const rate = 15.5; // USD to GHS approx
    const localAmount =
      newLinkData.currency === 'USD'
        ? Number((newLinkData.amount * rate).toFixed(2))
        : Number(newLinkData.amount);

    const linkItem = {
      id,
      title: newLinkData.title || 'Payment Order',
      amount: Number(newLinkData.amount),
      currency: newLinkData.currency || 'USD',
      localAmount,
      localCurrency: 'GHS',
      destination: newLinkData.destination || 'MTN Mobile Money (+233 24 819 2041)',
      shortUrl: `agilepay.me/x/${id}`,
      status: 'Active',
      views: 1,
      paymentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      note: newLinkData.note || '',
    };

    setLinks((prev) => [linkItem, ...prev]);
    showToast(`Payment Link generated: agilepay.me/x/${id}`);
    return linkItem;
  };

  const recordCheckoutPayment = (paymentData) => {
    const txId = 'tx_' + Math.floor(10000 + Math.random() * 90000);
    const newTx = {
      id: txId,
      customer: paymentData.customerName || 'Anonymous Buyer',
      email: paymentData.email || 'customer@gmail.com',
      date: 'Just now',
      amount: Number(paymentData.amount),
      currency: paymentData.currency || 'USD',
      localAmount: paymentData.localAmount || Number(paymentData.amount) * 15.5,
      localCurrency: 'GHS',
      channel: paymentData.channelLabel || 'Mobile Money',
      rail: 'Off-ramped via Lumx Base USDC',
      status: 'Paid - MoMo Sent',
      reference: 'AP-PAY-' + Math.floor(100000 + Math.random() * 900000),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Add webhook log automatically
    const newLog = {
      id: 'wh_log_' + Date.now(),
      event: 'payment.success',
      statusCode: 200,
      statusText: '200 OK',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      duration: '124ms',
      payload: {
        event: 'payment.success',
        data: {
          id: txId,
          amount: newTx.amount,
          currency: newTx.currency,
          channel: newTx.channel,
          offramp_status: 'completed',
          beneficiary: 'Merchant Account',
        },
      },
    };
    setWebhookLogs((prev) => [newLog, ...prev]);

    return newTx;
  };

  const createApiKey = (keyName) => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const modePrefix = isSandbox ? 'pk_test_' : 'pk_live_';
    const newKey = {
      id: 'key_' + Date.now(),
      name: keyName || (isSandbox ? 'Test Integration Key' : 'Production API Key'),
      mode: isSandbox ? 'sandbox' : 'live',
      prefix: `${modePrefix}${randomHex}...`,
      fullKey: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(keyName + Date.now())}.xYs8_AgilePayKeySecret`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys((prev) => [newKey, ...prev]);
    showToast('New API Key generated successfully');
    return newKey;
  };

  const deleteApiKey = (id) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    showToast('API Key revoked', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isSandbox,
        setIsSandbox,
        links,
        transactions,
        createPaymentLink,
        recordCheckoutPayment,
        apiKeys,
        createApiKey,
        deleteApiKey,
        partnerFee,
        setPartnerFee,
        webhookConfig,
        setWebhookConfig,
        webhookLogs,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-bounce bg-slate-900 text-white dark:bg-brand-600 dark:border-brand-500 border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
