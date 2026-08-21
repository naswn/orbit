"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers are not supported.");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

        console.log(
          "ORBIT Service Worker registered:",
          registration.scope
        );

        await registration.update();
      } catch (error) {
        console.error(
          "ORBIT Service Worker registration failed:",
          error
        );
      }
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, {
        once: true,
      });
    }

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}