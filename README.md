# API Documentation

Modern, interactive API documentation built with vanilla HTML, CSS, and JavaScript.

## 🚀 Features

- **Interactive API Explorer**: Test API endpoints directly from the browser
- **Dynamic Form Generation**: Forms automatically generated from OpenAPI/Swagger specs
- **Parameter Validation**: Required field validation with visual feedback
- **Syntax Highlighting**: JSON syntax highlighting for requests and responses
- **Responsive Design**: Works on desktop and mobile devices
- **Copy to Clipboard**: Easy copying of code examples and responses
- **Dark Theme**: Modern dark UI optimized for developers

## 📁 File Structure

```
app/
├── index.html      # Main HTML structure (clean and minimal)
├── styles.css      # All CSS styles and theming
├── script.js       # Interactive functionality and API handling
├── swagger.json    # OpenAPI/Swagger specification
└── README.md       # This file
```

## 🛠 Setup

1. **Clone or download** the files to your local machine
2. **Place your OpenAPI/Swagger JSON** file as `swagger.json` in the same directory
3. **Serve the files** using any web server (required for CORS):

### Option 1: Python Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Option 2: Node.js Server

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

### Option 3: PHP Server

```bash
php -S localhost:8000
```

4. **Open your browser** and navigate to `http://localhost:8000`

## 🎯 Usage

### Navigation

- Browse API endpoints in the left sidebar
- Endpoints are grouped by tags from your OpenAPI specification
- Click on any endpoint to view its details

### Try It Out

- Click the "Try it" button on any endpoint
- Fill in required parameters (marked with red asterisk \*)
- Path parameters are highlighted with blue "path" badge
- Click "Run Request" to execute the API call

### Parameter Types

- **Path Parameters**: Highlighted with blue badge, required for URL construction
- **Query Parameters**: Added as URL query string
- **Header Parameters**: Added to request headers
- **Request Body**: JSON payload for POST/PUT requests

### Validation

- Required fields are marked with red asterisk (\*)
- Form validation prevents requests with missing required data
- Invalid JSON in request body shows error message
- Visual feedback with red borders for validation errors

## 🎨 Customization

### Styling

All styles are contained in `styles.css`. Key customization areas:

- **Colors**: Modify the CSS custom properties at the top of the file
- **Layout**: Adjust grid and flexbox properties
- **Typography**: Change font families and sizes
- **Component Styles**: Modify individual component classes

### Functionality

Main JavaScript functions in `script.js`:

- `loadSwaggerData()`: Loads and processes OpenAPI specification
- `generateNavigation()`: Creates sidebar navigation
- `renderEndpointDetails()`: Displays endpoint information
- `generateTryItForm()`: Creates interactive forms
- `executeRequest()`: Handles API requests (currently simulated)

### API Integration

To connect to real APIs, modify the `executeRequest()` function in `script.js`:

1. Replace the simulated response with actual `fetch()` calls
2. Handle CORS if testing cross-origin requests
3. Add authentication headers as needed
4. Implement proper error handling

## 🔧 Configuration

### OpenAPI Specification

Ensure your `swagger.json` includes:

- **servers**: Base URL for API calls
- **components.securitySchemes**: Authentication methods
- **paths**: API endpoints with parameters and responses
- **parameters.required**: Mark required parameters
- **requestBody.required**: Mark required request bodies

### Example OpenAPI Parameter:

```json
{
  "name": "userId",
  "in": "path",
  "required": true,
  "description": "User identifier",
  "schema": {
    "type": "string",
    "example": "12345"
  }
}
```

## 🌟 Features in Detail

### Form Generation

- Automatically creates appropriate input types based on parameter schemas
- Handles enums as select dropdowns
- Supports number, string, and boolean types
- Includes parameter descriptions and examples

### Validation System

- Client-side validation for required fields
- Visual feedback with border colors
- Toast notifications for user feedback
- Prevents invalid requests from being sent

### Code Examples

- Generates cURL commands for each endpoint
- Shows request/response examples
- Syntax highlighting for JSON
- Copy-to-clipboard functionality

### Responsive Design

- Mobile-friendly interface
- Collapsible navigation sections
- Adaptive layout for different screen sizes
- Touch-friendly controls

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Serve files through a web server, not file:// protocol
2. **Swagger Not Loading**: Check that `swagger.json` is in the correct location
3. **Parameters Not Showing**: Verify OpenAPI specification format
4. **Styling Issues**: Check CSS file path in HTML

### Browser Compatibility

- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
- ES6+ JavaScript features required
- CSS Grid and Flexbox support needed

## 📝 License

This project is open source. Feel free to modify and distribute as needed.

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Verify your OpenAPI specification format
3. Test with a simple HTTP server setup
