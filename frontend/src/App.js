import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import WASM module (generated via wasm-pack)
import initWasm, { grayscale } from "./wasm_module/pkg";

const requireImages = require.context('./test', false, /\.(jpe?g|png|gif|webp|bmp|ico|svg|tif|tiff|avif|heif|heic|jxl)$/i);
const imagePaths = requireImages.keys();

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [filteredImageUrl, setFilteredImageUrl] = useState(null);
  const [log, setLog] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [wasmReady, setWasmReady] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showPlots, setShowPlots] = useState(false);

  useEffect(() => {
    async function initializeWasm() {
      try {
        await initWasm();
        // Warm up the WASM function with a small dummy input.
        const dummyData = new Uint8ClampedArray([255, 128, 64, 255, 100, 200, 50, 255]); // 2 pixels (RGBA).
        grayscale(dummyData, 2, 1); // Warm-up call.
        setWasmReady(true);
        setLog("WASM module initialized");
      } catch (e) {
        console.error("WASM initialization failed:", e);
        setLog("Failed to initialize WASM module");
      }
    }
    initializeWasm();
  }, []);

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected");
      alert("No file selected");
      return;
    }

    console.log("Selected file:", { name: file.name, type: file.type, size: file.size });

    // Optional: Limit file size.
    if (file.size > 50 * 1024 * 1024) {
      console.error("File too large:", file.size);
      alert("File is too large. Please upload an image smaller than 50MB.");
      return;
    }

    // Validate image file.
    const isImageType = file.type.startsWith("image/");
    const isImageExt = /\.(jpe?g|png|gif|webp|bmp|ico|svg|tif|tiff|avif|heif|heic|jxl)$/i.test(file.name);

    if (!isImageType && !isImageExt) {
      console.error("Invalid file type:", file.type, file.name);
      alert("Only image files are supported (e.g., JPG, PNG, GIF, WEBP, BMP, SVG, TIFF, AVIF, HEIF, HEIC, JXL)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result);
      setFilteredImageUrl(null);
      setLog(wasmReady ? "" : "WASM module still initializing...");

      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
      };
      img.onerror = () => {
        console.error("Failed to load image:", file.name);
        alert("Failed to load the image. The file might be corrupted or unsupported.");
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      console.error("Failed to read file:", file.name);
      alert("Failed to read the file.");
    };
    reader.readAsDataURL(file);

    // Reset file input to allow selecting the same file again
    event.target.value = null;
  }

  // JS Native grayscale filter for ImageData
  function jsGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    return imageData;
  }

  // Handler to process with JS native function.
  async function handleJSFilter() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    } catch (e) {
      console.error("JS filter error:", e);
      setLog("Cannot apply filter due to security restrictions (e.g., CORS).");
      return;
    }
    const start = performance.now();
    const result = jsGrayscale(imageData);
    const end = performance.now();
    ctx.putImageData(result, 0, 0);
    setLog(`JS Native grayscale filter took ${(end - start).toFixed(2)} ms`);
    setFilteredImageUrl(canvasRef.current.toDataURL("image/png"));
  }

  // Handler to process with Rust WASM module.
  async function handleWasmFilter() {
    if (!canvasRef.current) return;
    if (!wasmReady) {
      setLog("WASM module not yet initialized. Please try again.");
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    } catch (e) {
      console.error("WASM filter error:", e);
      setLog("Cannot apply filter due to security restrictions (e.g., CORS).");
      return;
    }
    const { width, height, data } = imageData;
    const start = performance.now();
    // Call WASM grayscale filter with mutable data.
    const outputImageData = grayscale(data, width, height);
    const end = performance.now();
    ctx.putImageData(outputImageData, 0, 0);
    setLog(`Rust WASM grayscale filter took ${(end - start).toFixed(2)} ms`);
    setFilteredImageUrl(canvasRef.current.toDataURL("image/png"));
  }

  // Handler to process with Rust API call.
  async function handleRustApiFilter() {
    if (!canvasRef.current) return;
    let dataUrl;
    try {
      dataUrl = canvasRef.current.toDataURL("image/png");
    } catch (e) {
      console.error("Rust API filter error:", e);
      setLog("Cannot apply filter due to security restrictions (e.g., CORS).");
      return;
    }
    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append("file", blob, "image.png");
    const start = performance.now();
    const response = await fetch("http://127.0.0.1:8080/filter", {
      method: "POST",
      body: formData,
    });
    const end = performance.now();
    if (response.ok) {
      const filteredBlob = await response.blob();
      const url = URL.createObjectURL(filteredBlob);
      setFilteredImageUrl(url);
      setLog(`Rust API grayscale filter took ${(end - start).toFixed(2)} ms`);
    } else {
      console.error("Rust API filter failed:", response.status, response.statusText);
      alert("Rust API filter failed");
    }
  }

  async function handleTest() {
    if (!wasmReady) return;
    setLog('Running tests...');
    const results = [];
    for (const path of imagePaths) {
      const imgSrc = requireImages(path);
      const imageName = path.replace('./', '');
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgSrc;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // JS Filter
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let start = performance.now();
        jsGrayscale(imageData);
        let jsTime = performance.now() - start;

        // WASM Filter
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Reset
        start = performance.now();
        grayscale(imageData.data, canvas.width, canvas.height);
        let wasmTime = performance.now() - start;

        // API Filter
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        start = performance.now();
        const response = await fetch('http://127.0.0.1:8080/filter', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          await response.blob();
        } else {
          console.error(`API failed for ${imageName}`);
        }
        let apiTime = performance.now() - start;

        results.push({ imageName, jsTime, wasmTime, apiTime });
      } catch (e) {
        console.error(`Error processing ${imageName}:`, e);
      }
    }
    setTestResults(results);
    setShowPlots(true);
    setLog('Tests completed');
  }

  // Calculate average times for the bar chart
  const avgTimes = testResults.length ? [
    {
      name: 'Average Times',
      JS: (testResults.reduce((sum, r) => sum + r.jsTime, 0) / testResults.length).toFixed(2),
      WASM: (testResults.reduce((sum, r) => sum + r.wasmTime, 0) / testResults.length).toFixed(2),
      API: (testResults.reduce((sum, r) => sum + r.apiTime, 0) / testResults.length).toFixed(2),
    }
  ] : [];

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Image Grayscale Filter with JS, WASM, Rust API</h1>

      <div
        style={{
          border: "3px dashed #0078d4",
          borderRadius: 10,
          padding: 30,
          textAlign: "center",
          marginBottom: 20,
          color: "#0078d4",
          fontWeight: "bold",
        }}
      >
        <label
          htmlFor="fileInput"
          style={{
            cursor: "pointer",
            padding: "10px 15px",
            backgroundColor: "#0078d4",
            color: "white",
            borderRadius: 6,
            display: "inline-block",
          }}
        >
          Select Image
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <p style={{ marginTop: 10 }}>Choose an image file from your device</p>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxHeight: 400, marginBottom: 10, borderRadius: 10, boxShadow: "0 0 8px rgba(0,0,0,0.2)" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <button disabled={!originalImage} onClick={handleJSFilter} style={buttonStyle}>
          JS Native
        </button>
        <button disabled={!originalImage || !wasmReady} onClick={handleWasmFilter} style={buttonStyle}>
          Rust WASM
        </button>
        <button disabled={!originalImage} onClick={handleRustApiFilter} style={buttonStyle}>
          Rust API
        </button>
        <button disabled={!wasmReady} onClick={handleTest} style={buttonStyle}>
          Test
        </button>
      </div>

      {filteredImageUrl && (
        <a
          href={filteredImageUrl}
          download="filtered_image.png"
          style={{ display: "block", textAlign: "center", color: "#0078d4", fontWeight: "bold" }}
        >
          Download Filtered Image
        </a>
      )}

      {log && <p style={{ fontWeight: "bold", textAlign: "center" }}>{log}</p>}

      {showPlots && (
        <div style={{ marginTop: 20, padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
          <button onClick={() => setShowPlots(false)} style={{ ...buttonStyle, backgroundColor: '#d40000', marginBottom: 10 }}>
            Close Plots
          </button>
          <h2 style={{ textAlign: "center" }}>Time per Image (ms)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={testResults.map(({ imageName, jsTime, wasmTime, apiTime }) => ({
              name: imageName,
              JS: jsTime.toFixed(2),
              WASM: wasmTime.toFixed(2),
              API: apiTime.toFixed(2),
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} ms`, name]} />
              <Legend />
              <Bar dataKey="JS" fill="#8884d8" />
              <Bar dataKey="WASM" fill="#82ca9d" />
              <Bar dataKey="API" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
          <h2 style={{ textAlign: "center", marginTop: 20 }}>Average Times (ms)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} ms`, name]} />
              <Legend />
              <Bar dataKey="JS" fill="#8884d8" />
              <Bar dataKey="WASM" fill="#82ca9d" />
              <Bar dataKey="API" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "10px 15px",
  borderRadius: 6,
  border: "none",
  backgroundColor: "#0078d4",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

export default App;