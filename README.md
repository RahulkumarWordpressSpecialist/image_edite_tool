# OptiPix - AI Image Editor & Compressor

OptiPix is a modern, secure, client-side image optimization and editing tool built with React, TypeScript, and Tailwind CSS. It integrates the Google Gemini API for powerful AI-based image transformations while performing standard editing and compression tasks entirely within the browser using the HTML5 Canvas API.

## Features

- **Smart Compression**: Optimize images for the web by converting between JPEG, PNG, and WebP formats. Adjust quality settings to reduce file size by up to 90%.
- **Local Editing**: Real-time adjustments for brightness, contrast, saturation, blur, rotation, and flipping.
- **Privacy-First Architecture**: All standard edits and compressions are processed locally on your device. Your images are only sent to the cloud if you explicitly use the AI generation feature.
- **SEO Optimization**: Includes a built-in guide on image optimization best practices for better search engine ranking.

## Tech Stack

- **Frontend Framework**:React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **Image Processing**: HTML5 Canvas API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js installed
- A Google Gemini API Key (obtained from Google AI Studio)

### Installation 

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/optipix.git
   cd optipix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your API key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm start
   ```

## Usage Guide

1. **Upload**: Drag and drop an image (JPG, PNG, WebP) onto the landing zone.
2. **Edit**: 
   - Use the **Edit** tab to adjust brightness, contrast, and orientation.
3. **AI Generation**:
   - Switch to the **AI** tab.
   - Enter a text prompt describing the desired change.
   - Click "Generate" to use Gemini AI.
4. **Compress & Export**:
   - Switch to the **Compress** tab.
   - Select your desired output format (WebP is recommended for web).
   - Adjust the quality slider.
   - Set maximum width/height if resizing is needed.
5. **Save**: Click the "Save Image" button in the header to download your optimized image.

## License

This project is open source and available under the [MIT License](LICENSE).
