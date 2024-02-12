
import React from "react";

function useImageStorage() {
    const dbPromise = React.useMemo(() => idbOpen(), []);
  
    async function idbOpen() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("imagesDatabase", 1);
  
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images", {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        };
  
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
  
        request.onerror = (event) => {
          reject(
            "IndexedDB opening error: " +
              (event.target as IDBOpenDBRequest).error,
          );
        };
      });
    }
  
    async function storeImage(blob: Blob, title?: string, description?: string) {
      const db = (await dbPromise) as IDBDatabase;
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const timestamp = new Date();
      const id = await store.put({ blob, title, description, timestamp });
      await new Promise<void>((resolve) => (tx.oncomplete = () => resolve()));
      return id;
    }
  
    async function fetchImages() {
      const db = (await dbPromise) as IDBDatabase;
      const tx = db.transaction("images", "readonly");
      const store = tx.objectStore("images");
  
      const images = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
  
      return images.reverse().map((imgRecord) => ({
        url: URL.createObjectURL(imgRecord.blob),
        title: imgRecord.title,
        description: imgRecord.description,
      }));
    }
  
    return { storeImage, fetchImages };
  }

  export { useImageStorage };