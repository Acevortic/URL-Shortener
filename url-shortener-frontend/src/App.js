import { useState } from "react";

function App() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const response = await fetch("http://localhost:8000/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalUrl: url }),
        });

        const data = await response.json();
        if (data.shortUrl) {
            setShortUrl(data.shortUrl);
        } else {
            alert("Invalid URL. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>URL Shortener</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button type="submit">Shorten</button>
            </form>
            {shortUrl && (
                <div>
                    <p>Shortened URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a></p>
                </div>
            )}
        </div>
    );
}

export default App;


