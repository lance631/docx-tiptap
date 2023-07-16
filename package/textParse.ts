export default function textToProseMirror(blob: Blob): Promise<string> {
    // ...
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(blob);
      });
  }