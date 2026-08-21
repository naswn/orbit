"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "ORBIT Service Worker registered:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error(
              "ORBIT Service Worker registration failed:",
              error
            );
          });
      });
    }
  }, []);

  return null;
}