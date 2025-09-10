<div dir="rtl">

# تحقیق فنی درباره WebAssembly (WASM)

## مقدمه


وب از روزهای ابتدایی خود، راهی طولانی را طی کرده است. در ابتدا وب تنها شامل اسناد متنی ساده و تصاویر کوچک بود. اما امروزه، همان مرورگرها که برای خواندن مقالات ساده طراحی شده بودند، در حال اجرای نرم‌افزارهای پیچیده‌ای مثل **Figma**، **AutoCAD Web** یا حتی موتورهای بازی هستند.  
این تغییر تصادفی نبوده؛ پشت آن دهه‌ها تکامل در فناوری‌های وب و مهم‌تر از همه ظهور ابزارهایی مثل **WebAssembly (WASM)** قرار دارد.  

اگر به عنوان توسعه‌دهنده‌ای با تجربه وارد دنیای وب شوید، احتمالاً در نقطه‌ای به محدودیت‌های جاوااسکریپت برخورد کرده‌اید. هرچند جاوااسکریپت با موتورهای پیشرفته مثل **V8** در Chrome یا **SpiderMonkey** در Firefox فوق‌العاده سریع شده، اما همچنان اجرای محاسبات سنگین یا اپلیکیشن‌های بزرگ مهندسی با آن دشوار است. اینجا همان جایی است که WASM به میدان می‌آید [1].

---

## اپلیکیشن‌های وب چگونه اجرا می‌شوند؟

برای درک بهتر WASM، لازم است ابتدا بدانیم که مرورگرها چگونه اپلیکیشن‌های وب معمولی را اجرا می‌کنند [2].  
وقتی شما یک URL را وارد می‌کنید:

۱. مرورگر وب درخواست http را به سمت سرور ارسال میکند.  
۲. سرور وب درخواست مد نظر را به Application Server برنامه میفرستد. <br>
۳. برنامه پردازش‌های لازم را انجام داده، api های مورد نظر را فرا میخواند، ارتباط با پایگاه داده‌ را ایجاد میکند و پس از تولید خروجی آن را به سمت web server برمیگرداند.<br>
‌۴. مرورگر خروجی به دست آمده را پردازش میکند، گره‌های مورد نیاز را باز پردازش میکند و به کاربر نشان میدهد.

موتورهای جاوااسکریپت (مانند V8) در این مرحله نقش اساسی دارند. آنها کد JS را به صورت **Just-In-Time (JIT)** کامپایل کرده و بهینه‌سازی می‌کنند تا سریع‌تر اجرا شود. اما باز هم، JS یک زبان سطح بالا و تفسیری است. به همین دلیل برای کارهایی مثل پردازش تصویر، یادگیری ماشین یا رمزنگاری، عملکرد آن به اندازه کافی بالا نیست.

WebAssembly یا به اختصار WASM، یک فرمت باینری سطح پایین است که مرورگرها می‌توانند آن را با سرعتی نزدیک به نرم‌افزارهای native اجرا کنند. این فرمت در سال ۲۰۱۵ معرفی شد و به سرعت به استانداردی تحت نظارت W3C تبدیل گشت [3].  

هدف اصلی WASM این بود که توسعه‌دهندگان بتوانند نرم‌افزارهایی که قبلاً روی دسکتاپ نوشته شده بودند را به راحتی وارد مرورگر کنند، بدون اینکه مجبور باشند کل پروژه را با جاوااسکریپت بازنویسی کنند.  


---

## وب‌اسمبلی (WebAssembly) چیست و چرا ساخته شد؟

وب‌اسمبلی در واقع نوعی از برنامه‌نویسی میباشد که در آن میتوان زبان های سطح پایینی مانند `c`, `c++`,  `c#`و `Rust` را به نوعی در آن توسعه داد که با سرعتی مشابه حالت بومی (near-native speed) بتوان آن ها را بر روی مرورگرهای امروزی اجرا کرد [1].

وب‌اسمبلی طراحی شده است تا بتوان در میان کدهای JavaScript که در واقع بنای Web Application ها هستند آن را اجرا کرد. با استفاده از API های JavaScript میتوان `Module` های وب‌اسمبلی را در یک اپلیکیشن JavaScript بارگذاری کرد و از عملکرد آن‌ها در کنار یکدیگر بهره برد.

وب‌اسمبلی ساخته شده تا نه تنها بتوان کد‌های نوشته‌شده در زبان‌های مختلف را در کنار یکدیگر و در بستر وب با سرعت near-native اجرا کرد، بلکه بتوان کارایی‌هایی را تحت ساختار برنامه‌های وب ارائه داد که پیش‌تر ممکن نبود. وب اسمبلی این امکان را فراهم میکند تا کدهایی نوشت که بدون نیاز به دخالت در بخش‌های ارتباط با کاربر، عملیات های پردازی سنگین را در محیطی ایزوله (sand-box) اجرا کنند [3].

---

## اهداف طراحی WASM

وقتی استانداروقتی استاندارد WASM طراحی شد، چند هدف اصلی در نظر گرفته شد [3][6]:

۱. سرعت بالا؛ اجرای کدها با کارایی نزدیک به native و استفاده از قابلیت‌های مشترک در سخت‌افزارهای مدرن. <br>

۲. ایمنی؛ کد قبل از اجرا اعتبارسنجی شده و در یک محیط ایزوله و memory-safe اجرا می‌شود تا از فساد داده یا نفوذ امنیتی جلوگیری گردد. <br>

۳. تعریف دقیق؛ رفتار برنامه‌ها و قوانین معتبر بودن آن‌ها به طور کامل و شفاف مشخص شده است، به‌گونه‌ای که بتوان هم به صورت غیررسمی و هم رسمی (formal) درباره‌شان استدلال کرد. <br>

۴. سخت‌افزار مستقل؛ امکان کامپایل و اجرا روی تمام معماری‌های مدرن اعم از دسکتاپ، موبایل یا سیستم‌های تعبیه‌شده (embedded systems). <br>

۵. زبان مستقل؛ WASM محدود به هیچ زبان برنامه‌نویسی، مدل برنامه‌نویسی یا مدل شیء خاصی نیست. <br>

۶. پلتفرم مستقل؛ می‌تواند داخل مرورگر تعبیه شود، به عنوان یک ماشین مجازی مستقل اجرا گردد، یا در محیط‌های دیگر ادغام شود. <br>

۷. باز بودن؛ برنامه‌ها می‌توانند به شکلی ساده و جهانی با محیط خود تعامل و تبادل داده داشته باشند. <br>

این اهداف دقیقاً مشکلاتی را هدف گرفتند که سال‌ها جامعه وب با آن‌ها دست و پنجه نرم می‌کرد.

---
## ساختار یک برنامه‌ی وب‌اسمبلی و اجزای آن

یک برنامه‌ی وب‌اسمبلی در قالب یک **ماژول (Module)** بسته‌بندی می‌شود. ماژول‌ها فایل‌های باینری با پسوند `.wasm` هستند که مرورگرها می‌توانند آن‌ها را بارگذاری و اجرا کنند [6].  

اجزای اصلی یک ماژول WASM عبارتند از:

۱. **ماژول/Module**: واحد اصلی کد وب‌اسمبلی. شامل توابع، حافظه و جدول‌ها.  
۲. **حافظه/Memory**: حافظه خطی (Linear Memory) که در واقع آرایه‌ای بزرگ از بایت‌هاست و می‌تواند در حین اجرا گسترش یابد.  
۳. **توابع/Functions**: توابعی که منطق برنامه را پیاده‌سازی می‌کنند. این توابع می‌توانند از جاوااسکریپت فراخوانی شوند یا برعکس.  
۴. **جدول/Table**: ساختاری برای نگهداری رفرنس‌ها به توابع یا اشیاء، که امکان پیاده‌سازی قابلیت‌هایی مثل polymorphism را فراهم می‌کند.  
۵. **ورود و خروج/Import/Export**: ماژول می‌تواند از محیط بیرونی (مثل جاوااسکریپت) توابع/منابع دریافت کرده (Import) یا توابعی را در اختیار محیط بیرونی بگذارد (Export).  
۶. **نمونه/Instance**: پس از بارگذاری ماژول، یک نمونه (Instance) ساخته می‌شود که آماده اجرا است.  

به طور خلاصه، یک برنامه‌ی WASM ترکیبی است از کدی کامپایل‌شده به فرمت باینری، همراه با رابط‌هایی برای تعامل با دنیای بیرون (جاوااسکریپت یا مرورگر) [1][6].

---

## محدودیت های وب‌اسمبلی

عدم وجود چند‌ساله‌ی این مبحث در حوزه‌ی تکنولوژی، هنوز کاستی‌های بسیاری تا رسیدن به یک وضعیت پایدار و پسندیده از طرف جامعه‌ی توسعه‌دهدندگان برای این تکنولوژی وجود دارد.

از کاستی های موجود میتوان به عدم‌ اجازه‌ی مرورگر‌ها به تغییر DOM (Document Object Model) به طور مستقیم توسط کد وب‌اسمبلی، مشکلات مدیریت و اختصاص حافظه، کاستی‌هایی در بخش پردازش موازی و شروط اجازه‌ دادن اجرای آن بر روی مرورگرها مانند فعال نبودن Content-Security-Policy یا unsafe-eval بودن روی مرورگر ها اشاره کرد [4].

---

## وب‌اسمبلی: مزایا و معایب
### مزایا

شاید بزرگ‌ترین مزیت WASM این باشد که بالاخره می‌توانیم نرم‌افزارهایی با سطح کارایی بالا را در مرورگر اجرا کنیم. به جای اینکه یک موتور بازی یا کتابخانه رمزنگاری را دوباره با JS بنویسیم، کافی است همان نسخه دسکتاپ را به WASM کامپایل کنیم.

ماژول وب‌اسمبلی همچنین امنیت بالایی دارد؛ چون در یک محیط sandbox اجرا می‌شود و نمی‌تواند مستقیماً به منابع سیستم دسترسی داشته باشد. همین موضوع باعث می‌شود که اجرای کدهای ناشناس در وب امن‌تر باشد.

علاوه بر این، WASM قابل حمل است. همان فایل WASM روی ویندوز، لینوکس، مک و حتی موبایل دقیقاً یکسان اجرا می‌شود.

همچنین، WASM در پروژه‌هایی مثل Figma توانسته سرعت اجرای اپلیکیشن را تا سه برابر افزایش دهد [5].

### معایب

اما WASM هنوز کامل نیست. بزرگ‌ترین محدودیت آن عدم دسترسی مستقیم به DOM است. اگر بخواهید با عناصر صفحه تعامل داشته باشید، باید از جاوااسکریپت کمک بگیرید.

همچنین، ابزارهای آن هنوز پیچیده‌اند. برای یک توسعه‌دهنده عادی وب که به جاوااسکریپت عادت کرده، ورود به دنیای C یا Rust آسان نیست.
در نهایت، برخی ویژگی‌های پیشرفته مثل garbage collection یا multi-threading هنوز در حال توسعه هستند [4].

---
## موارد و نمونه های استفاده‌ی وب‌اسمبلی

با توجه‌ به ویژگی‌های وب‌اسمبلی، از نمونه‌ کاربردهای آن میتوان به گستره‌ی بسیاری از وب‌اپلیکیشن هایی که به کار با فایل‌ها، محاسبات سریع، دستورات سطح پایین تر و... دارند اشاره کرد. مانند [4]:

۱. ویرایش تصاویر و ویدیوها <br>
۲. بازی‌ها <br>
۳. اپلیکیشن‌های طراحی مانند figma (استفاده از وب‌اسمبلی تا سه برابر سرعت این اپ را بهبود داد.) [5] <br>
۴. برنامه‌های پخش و استریم موسیقی <br>
۵. برنامه های طراحی مانند نرم‌افزارهای CAD <br>
۶. برنامه‌های رمزگذاری <br>
...

---
## منابع:

۱. https://developer.mozilla.org/en-US/docs/WebAssembly <br>
۲. https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works <br>
۳. https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts#webassembly_goals <br>
۴. https://webassembly.org/docs/use-cases <br>
۵. https://madewithwebassembly.com/showcase/figma/#:~:text=Figma%20uses%20WebAssembly%2C%20as%20the,and%20saw%203x%20performance%20increase! <br>
۶. https://webassembly.github.io/spec/core/intro/introduction.html <br>


# پروژه‌ی تحقیق وب‌اسمبلی:
توضیحات و همچنین دستورات مورد نیاز برای اجرای پروژه در ادامه‌ آورده شده، اما به علت درهم آمیختگی بسیار زبان انگلیسی و اجرا و نصب نیازمندی های مورد نیاز یک اپلیکیشن بر روی سیستم‌عامل و همچنین سختی مدیریت تغییرات زبان در readme پروژه که طبق تعریف پروژه تنها راه مورد قبول مستندات است، بخش زیر کاملا به زبان انگلیسی نوشته شده.


# Research Project Documentation

## Purpose of the Code

This project is designed to be a minimal example of WebAssembly (WASM). this project compare the performance of three different methods for applying a grayscale filter to images: JavaScript (JS) native implementation, Rust compiled to WebAssembly (WASM), and a Rust-based API server. The goal is to evaluate and benchmark the execution speed of these approaches in a web environment, providing insights into their efficiency for image processing tasks. This comparison is particularly useful for understanding the trade-offs between client-side processing (JS and WASM) and server-side processing (Rust API) in terms of speed, scalability, and practical application in a React-based web application.

The project serves as a proof-of-concept to:
- **Good and minimal example of architecture of a WASM project**: This project, first of all aims to show you how you can start programming with WASM, using a small project as an example.
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
- **Hardware**: No special requirements.
- **OS**: unix based operating systems are suggested.
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
