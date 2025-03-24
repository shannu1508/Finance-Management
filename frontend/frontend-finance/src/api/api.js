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
export const fetchFromDatabase = async () => {
    try {
        const response = await fetch('http://localhost:5000/predict/database', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
            // Handle non-2xx HTTP status codes
            const errorData = await response.json(); // Attempt to parse error response
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching data from database:', error);
        // Handle the error appropriately in your component
        throw error; // Re-throw the error to be handled in the component
    }
};
