# AI-Powered Misinformation Analysis Platform

Tech Stack: React, Node.js, MySQL, Gemini API, Chart.js.

This project focuses on explainable AI and real-world usability, allowing users to verify both raw text and live news URLs.

## AI Fact Checker - React Frontend

Modern, responsive React frontend for the AI-Powered Fake News Detection System built with Vite, React Router, and Tailwind CSS.

## 📋 Features

- ✨ **Modern UI** - Dark theme with gradient effects and glassmorphism
- 🚀 **Lightning Fast** - Built with Vite for instant dev feedback
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- 🎯 **Real-time Analysis** - Instant fake news detection using AI
- 📊 **History Tracking** - Keep track of all previous analyses
- 🎨 **Beautiful Components** - Reusable, well-organized React components
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter to analyze news
- 📈 **Visual Confidence** - Progress bars and badges for results
- ♿ **Accessible** - WCAG compliant with proper focus states

## 🛠️ Tech Stack

- **React** 18.2 - Modern UI library
- **Vite** 4.3 - Lightning-fast build tool
- **React Router** 6.14 - Client-side routing
- **Tailwind CSS** 3.3 - Utility-first CSS framework
- **Axios** 1.4 - HTTP client for API calls
- **React Icons** 4.10 - Beautiful icon library

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Navbar.jsx       # Top navigation bar
│   ├── NewsInput.jsx    # Text input for news content
│   ├── ResultCard.jsx   # Analysis result display
│   ├── Loader.jsx       # Loading spinner
│   └── HistoryTable.jsx # History display
├── pages/               # Page components
│   ├── Home.jsx         # Main analysis page
│   └── HistoryPage.jsx  # History page
├── services/            # API services
│   └── api.js          # Axios API client
├── assests/            # Static assets
│   └── style.css       # Global styles
├── App.jsx             # Root app component
├── main.jsx            # React entry point
└── routes.jsx          # Route definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn
- Backend server running on `http://localhost:5000`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (when configured)

## 🎨 Design System

### Colors
- **Background**: `#0f172a` (slate-950)
- **Card**: `#1e293b` (slate-800)
- **Primary**: `#6366f1` (indigo)
- **Success**: `#22c55e` (green)
- **Danger**: `#ef4444` (red)

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scaling for mobile, tablet, and desktop

### Spacing & Borders
- **Rounded corners**: `xl` (8px) for cards, `lg` (8px) for inputs
- **Shadows**: Subtle, dark-themed shadows
- **Borders**: Semi-transparent slate colors for depth

## 🔌 API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`

### Available Endpoints

#### POST /predict
Analyze news content for being fake or real.

**Request:**
```json
{
  "text": "News article content here..."
}
```

**Response:**
```json
{
  "result": "Real" | "Fake",
  "confidence": 87,
  "explanation": "AI reasoning and analysis..."
}
```

#### GET /history
Retrieve all previous analysis results.

**Response:**
```json
[
  {
    "text": "News article...",
    "result": "Real" | "Fake",
    "confidence": 87,
    "explanation": "AI reasoning...",
    "timestamp": "2024-02-21T10:30:00Z"
  }
]
```

## 🎯 Component Guide

### Navbar
- Fixed top navigation with app logo and links
- Glass effect with backdrop blur
- Responsive gradient text

### NewsInput
- Textarea with 5000 character limit
- Real-time character counter
- Color-coded progress bar (green → yellow → red)
- Ctrl+Enter shortcut for submission
- Input validation with error messages

### ResultCard
- Animated appearance with fade-in effect
- Badge showing REAL (green) or FAKE (red)
- Confidence progress bar
- AI explanation text
- Result metadata (date, source)

### HistoryTable
- Desktop: Full-featured table layout
- Mobile: Card-based layout
- Sort and filter capabilities (future)
- Statistics dashboard (total, fake, real)
- Refresh button for manual reload

### Loader
- Animated spinner with gradient
- Centered loading state
- Smooth rotation animation

## 🎨 Tailwind CSS Customization

Custom utilities and animations are defined in:
- `tailwind.config.js` - Theme configuration
- `src/assests/style.css` - Global styles and animations

### Custom Animations
- `animate-fade-in` - Smooth fade-in with slide up
- `animate-slide-up` - Vertical slide up animation
- `animate-pulse-subtle` - Gentle pulsing effect

## 🔒 Environment Setup

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AI Fact Checker
VITE_APP_DESCRIPTION=AI-Powered Fake News Detection System
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are optimized for each breakpoint.

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for icons
- Keyboard navigation support
- Focus indicators for form elements
- Proper color contrast ratios
- Disabled state handling

## 📊 Performance Optimizations

- Code splitting with React Router
- Lazy loading of components (can be implemented)
- Optimized images and assets
- Minified production build
- Gzip compression ready

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 5174
```

### Backend Connection Issues
- Verify backend is running on `http://localhost:5000`
- Check CORS configuration on backend
- Ensure `.env` has correct API URL

### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

## 📄 License

This project is part of the AI-Powered Fake News Detection System.

## 📧 Support

For issues, questions, or suggestions, please reach out to the development team.

---

Built with accurate information detection in mind.

