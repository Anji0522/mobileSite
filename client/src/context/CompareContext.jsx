import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.jsx';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const toast = useToast();
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('mv_compare_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mv_compare_list', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (mobile) => {
    if (compareList.length >= 4) {
      toast.warning('You can compare a maximum of 4 phones simultaneously.');
      return false;
    }
    if (compareList.some((m) => m._id === mobile._id || m.slug === mobile.slug)) {
      toast.info(`${mobile.name} is already in your comparison tray.`);
      return false;
    }
    setCompareList((prev) => [...prev, mobile]);
    toast.success(`Added ${mobile.name} to comparison.`);
    return true;
  };

  const removeFromCompare = (mobileId) => {
    setCompareList((prev) => prev.filter((m) => m._id !== mobileId && m.slug !== mobileId));
    toast.info('Removed from comparison.');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (mobileId) => {
    return compareList.some((m) => m._id === mobileId || m.slug === mobileId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
