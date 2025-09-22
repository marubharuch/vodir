import { useState, useEffect } from "react";
import localforage from "localforage";

const stores = {};

function getStore(storeName) {
  if (!stores[storeName]) {
    stores[storeName] = localforage.createInstance({
      name: "myApp",
      storeName,
    });
  }
  return stores[storeName];
}

export function useLocalDb(storeName, key, initialValue = null) {
  const [data, setData] = useState(initialValue);
  const store = getStore(storeName);

  useEffect(() => {
    let mounted = true;
    store.getItem(key).then((saved) => {
      if (mounted && saved !== null) setData(saved);
    });
    return () => {
      mounted = false;
    };
  }, [store, key]);

  const save = async (value) => {
    setData(value);
    await store.setItem(key, value);
  };

  const remove = async () => {
    setData(null);
    await store.removeItem(key);
  };

  return { data, save, remove };
}
