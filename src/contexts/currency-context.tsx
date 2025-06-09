'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'CRC' | 'USD' | 'EUR' | 'MXN';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CRC: '₡',
  USD: '$',
  EUR: '€',
  MXN: '$',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  CRC: 'CRC',
  USD: 'USD',
  EUR: 'EUR',
  MXN: 'MXN',
};

// Puedes actualizar estas tasas según tu preferencia o traerlas de una API externa
const CURRENCY_RATES: Record<Currency, number> = {
  CRC: 1,        // Base
  USD: 0.0019,   // 1 CRC = 0.0019 USD
  EUR: 0.0017,   // 1 CRC = 0.0017 EUR (ejemplo)
  MXN: 0.032,    // 1 CRC = 0.032 MXN (ejemplo)
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number) => number;
  symbol: string;
  currencyName: string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'CRC',
  setCurrency: () => {},
  convert: (amount) => amount,
  symbol: '₡',
  currencyName: 'CRC',
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('CRC');
  const [rate, setRate] = useState<number>(1);

  useEffect(() => {
    setRate(CURRENCY_RATES[currency]);
  }, [currency]);

  const convert = (amount: number) => amount * rate;
  const symbol = CURRENCY_SYMBOLS[currency];
  const currencyName = CURRENCY_NAMES[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol, currencyName }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
