export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);  // ✅ Debugging log
        return data;
    } catch (error) {
        console.error("Upload File Error:", error);
        return { error: "Failed to fetch predictions" };
    }
};
