// 64-bit difference hash (dHash) of a photo, as 16 hex characters.
// Two photos of the same slip give hashes only a few bits apart, so re-uploads can be spotted.
export const slipHash = (blob) =>
    new Promise((resolve) => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 9;
                canvas.height = 8;
                const context = canvas.getContext("2d", { willReadFrequently: true });
                context.drawImage(image, 0, 0, 9, 8);
                const { data } = context.getImageData(0, 0, 9, 8);
                const gray = (x, y) => {
                    const i = (y * 9 + x) * 4;
                    return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                };
                let bits = "";
                for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += gray(x, y) < gray(x + 1, y) ? "1" : "0";
                resolve(BigInt(`0b${bits}`).toString(16).padStart(16, "0"));
            } catch {
                resolve(null);
            } finally {
                URL.revokeObjectURL(url);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        image.src = url;
    });
