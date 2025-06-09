'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'CRC' | 'USD';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number) => number;
  symbol: string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'CRC',
  setCurrency: () => {}, // No-op por defecto
  convert: (amount) => amount,
  symbol: '₡',
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('CRC');
  const [rate, setRate] = useState<number>(1); // Tasa de conversión base (CRC)

  useEffect(() => {
    if (currency === 'USD') {
      setRate(0.0019); // Ejemplo: 1 CRC = 0.0019 USD
    } else {
      setRate(1);
    }
  }, [currency]);

  const convert = (amount: number) => {
    return amount * rate;
  };

  const symbol = currency === 'USD' ? '$' : '₡';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
