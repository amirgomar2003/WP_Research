# Research Project Documentation

## Purpose of the Code

This project is designed to compare the performance of three different methods for applying a grayscale filter to images: JavaScript (JS) native implementation, Rust compiled to WebAssembly (WASM), and a Rust-based API server. The goal is to evaluate and benchmark the execution speed of these approaches in a web environment, providing insights into their efficiency for image processing tasks. This comparison is particularly useful for understanding the trade-offs between client-side processing (JS and WASM) and server-side processing (Rust API) in terms of speed, scalability, and practical application in a React-based web application.

The project serves as a proof-of-concept to:
- **Compare Execution Times**: Measure how long each method (JS Native, Rust WASM, Rust API) takes to process images of varying sizes.
- **Prove Efficiency**: Demonstrate whether Rust-based solutions (WASM or API) offer performance advantages over a pure JavaScript implementation for computationally intensive tasks like image processing.
- **Visualize Results**: Use charts to display the processing times for individual images and their averages, making it easier to analyze performance differences.

The test functionality processes a set of images in the `test` directory, applies all three grayscale methods to each image, records the time taken, and visualizes the results in bar charts (one for per-image times and one for average times across all images). This helps in identifying which method performs best under different conditions.

## Project Structure

The project is organized into two main components: a frontend (React-based web application) and a backend (Rust web server). Below is the structure:

```
research_project/
├── frontend/
│   ├── src/
│   │   ├── wasm_module/        # Rust code for WASM module
│   │   │   ├── src/           # Rust source files for WASM grayscale filter
│   │   │   ├── Cargo.toml     # Rust configuration for WASM module
│   │   │   └── pkg/           # Generated WASM output (after wasm-pack build)
│   │   ├── test/              # Directory containing test images (e.g., .jpg, .png)
│   │   ├── App.js             # Main React component with image processing logic
│   │   ├── index.js           # React entry point
│   │   ├── package.json       # Node.js dependencies and scripts
│   │   └── ...                # Other React-related files (e.g., public/, node_modules/)
├── web_server/
│   ├── src/                   # Rust source files for the web server
│   ├── Cargo.toml             # Rust configuration for the web server
│   └── ...                    # Other server-related files (e.g., compiled binaries)
```

- **frontend/src/wasm_module**: Contains Rust code that implements the grayscale filter, compiled to WebAssembly using `wasm-pack`. The `pkg/` directory is generated after building and includes the WASM binary and JavaScript glue code.
- **frontend/src/test**: A directory with test images (e.g., JPG, PNG) used by the test functionality to benchmark the three methods.
- **frontend/src/App.js**: The core React component that handles image selection, applies grayscale filters (JS, WASM, or API), runs tests, and displays results in bar charts using the `recharts` library.
- **web_server**: A Rust-based web server that exposes an endpoint (`/filter`) to receive images, apply a grayscale filter, and return the processed image. This simulates a server-side processing scenario.

## How the Test Works

The test functionality is triggered by clicking the "Test" button in the React application. Here's how it works:

1. **Image Loading**:
   - The test uses `require.context` to dynamically load all images from the `frontend/src/test` directory that match supported extensions (e.g., `.jpg`, `.png`, `.gif`, `.webp`, etc.).
   - Each image is loaded into a temporary canvas for processing.

2. **Processing Each Image**:
   - For each image, the test applies three grayscale filters sequentially:
     - **JS Native**: A JavaScript function (`jsGrayscale`) that processes the image's pixel data directly in the browser, averaging RGB values for each pixel.
     - **Rust WASM**: A Rust function (`grayscale`) compiled to WebAssembly, called via the WASM module, which processes the pixel data and returns the result to the browser.
     - **Rust API**: Sends the image to the Rust web server at `http://127.0.0.1:8080/filter` via a POST request, receives the grayscale image, and measures the round-trip time.
   - The time taken for each method is recorded using `performance.now()` to capture the duration in milliseconds.

3. **Result Storage**:
   - The results for each image (image name, JS time, WASM time, API time) are stored in the `testResults` state array.

4. **Visualization**:
   - After processing all images, two bar charts are displayed:
     - **Time per Image**: Shows the processing time (in milliseconds) for each image across the three methods (JS, WASM, API). The X-axis lists image names, and the Y-axis shows time.
     - **Average Times**: Shows the average processing time for each method across all images in a single bar chart.
   - The charts are rendered using the `recharts` library and can be closed by clicking the "Close Plots" button.

5. **Error Handling**:
   - If an image fails to load or the Rust API server is unavailable, errors are logged to the console, and the test continues with the next image.

This test allows for a direct comparison of the three methods, highlighting differences in performance due to computational efficiency (JS vs. WASM) and network overhead (API).

## Instructions to Build and Run the Project

### Prerequisites
To run the project, ensure you have the following installed:
- **Node.js** (v14 or later): For running the React application.
- **npm** (comes with Node.js): For managing frontend dependencies.
- **Rust** (latest stable version): For building the WASM module and web server.
- **wasm-pack**: For compiling Rust to WebAssembly. Install it with:
  ```bash
  cargo install wasm-pack
  ```
- **A web browser**: For accessing the React application (e.g., Chrome, Firefox).
- **Cargo** (comes with Rust): For building and running the Rust web server.
- **Git** (optional): For cloning the project repository if applicable.

Ensure the `frontend/src/test` directory contains test images (e.g., `.jpg`, `.png`) for the test functionality to work.

### Step-by-Step Instructions

1. **Build the WASM Module**:
   - Navigate to the WASM module directory:
     ```bash
     cd frontend/src/wasm_module
     ```
   - Build the Rust code into a WebAssembly module:
     ```bash
     wasm-pack build --target web
     ```
   - This generates the `pkg/` directory containing the WASM binary and JavaScript glue code.

2. **Build and Run the Rust Web Server**:
   - Navigate to the web server directory:
     ```bash
     cd web_server
     ```
   - Build the Rust web server:
     ```bash
     cargo build
     ```
   - Run the web server:
     ```bash
     cargo run
     ```
   - The server should start on `http://127.0.0.1:8080`. Ensure it’s running before using the Rust API filter or running tests.

3. **Build and Run the React Application**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm run start
     ```
   - The application should open in your default browser at `http://localhost:3000` (or another port if 3000 is in use).

### Running the Application
- **Manual Image Processing**:
  - Open the React application in your browser.
  - Click "Select Image" to upload an image from your computer.
  - Use the "JS Native", "Rust WASM", or "Rust API" buttons to apply the grayscale filter.
  - The processing time is displayed, and you can download the filtered image.

- **Running Tests**:
  - Ensure the Rust web server is running.
  - Click the "Test" button to process all images in the `frontend/src/test` directory.
  - After completion, bar charts will display the processing times for each image and the average times across all images.
  - Click "Close Plots" to hide the charts.

### Troubleshooting
- **WASM Module Fails**: Ensure `wasm-pack` is installed and the `wasm_module` directory contains valid Rust code with a `Cargo.toml` file.
- **Rust API Errors**: Verify the Rust server is running at `http://127.0.0.1:8080`. Check for CORS issues if the API fails (configure the server to allow requests from `http://localhost:3000`).
- **Charts Not Displaying**: Ensure `recharts` is installed (`npm install recharts`) and the `test` directory contains images.
- **Test Folder Empty**: Add images to `frontend/src/test` to enable the test functionality.

## Requirements Summary
- **Hardware**: A modern computer with at least 4GB RAM and a multi-core CPU.
- **Software**:
  - Node.js (v14+)
  - npm (v6+)
  - Rust (latest stable)
  - wasm-pack
  - A web browser
- **Dependencies** (for React):
  - `recharts` (for charts)
  - Other dependencies listed in `frontend/package.json`
- **Network**: The Rust web server must be accessible at `http://127.0.0.1:8080` for API tests.
- **Test Images**: At least one image in `frontend/src/test` for testing.

This documentation should help you understand, build, and run the project effectively. Let me know if you need clarification or additional details!
