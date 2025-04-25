# Fractal Tree Generator

## Overview
The Fractal Tree Generator is an interactive web application that allows users to generate and visualize fractal trees on an HTML Canvas. The application is built using modern web technologies including HTML, CSS (Tailwind), and JavaScript (ES Modules). 

## Features
- **Interactive Controls**: Customize fractal generation with various parameters:
  - Randomness Control
  - Recursion Depth
  - Branch Angle
  - Branch Length Factor
  - Initial Trunk Size
  - Line Width Tapering
  - Animation Timing
  - Color Customization
  - Optional Accent Elements (e.g., flowers or dots)

- **Responsive Visualization**: A dynamic canvas that adapts to different screen sizes.

- **User Feedback**: Real-time display of current values for each control.

## Project Structure
```
fractal-tree-generator
├── public
│   └── index.html          # Main HTML structure
├── src
│   ├── assets
│   │   └── styles.css      # Custom styles using Tailwind CSS
│   ├── modules
│   │   ├── canvas.js       # Canvas drawing operations
│   │   ├── controller.js    # Application state management
│   │   ├── ui.js           # DOM manipulation and event handling
│   │   └── utils.js        # Helper functions
│   ├── app.js              # Entry point of the application
│   └── vite.config.js      # Vite configuration
├── package.json            # npm configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd fractal-tree-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage
- Use the controls in the sidebar to customize the fractal tree generation parameters.
- Click the "Generate" button to create the fractal tree.
- Use the "Clear" button to reset the canvas.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.