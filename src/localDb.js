import localforage from "localforage";

// અલગ અલગ store બનાવવા માટે
export const authStore = localforage.createInstance({
  name: "myApp",
  storeName: "auth",
});

export const profileStore = localforage.createInstance({
  name: "myApp",
  storeName: "profiles",
});

export const dataStore = localforage.createInstance({
  name: "myApp",
  storeName: "data",
});
