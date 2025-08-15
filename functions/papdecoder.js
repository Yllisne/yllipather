function replacePapString(file, oldString, newString) {
    if (newString.length !== oldString.length) {
        console.error("Replacement string must be the same length!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        let buffer = e.target.result;
        let bytes = new Uint8Array(buffer);

        function strToBytes(str) {
            return Array.from(str).map(c => c.charCodeAt(0));
        }

        let oldBytes = strToBytes(oldString);
        let newBytes = strToBytes(newString);

        // Search and replace
        for (let i = 0; i < bytes.length - oldBytes.length; i++) {
            let match = true;
            for (let j = 0; j < oldBytes.length; j++) {
                if (bytes[i + j] !== oldBytes[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                for (let j = 0; j < newBytes.length; j++) {
                    bytes[i + j] = newBytes[j];
                }
            }
        }

        // Download modified file
        const blob = new Blob([bytes], { type: "application/octet-stream" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
    };

    reader.readAsArrayBuffer(file);
}