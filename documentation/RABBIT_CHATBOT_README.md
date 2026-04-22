# 🐰💕 Espoir - The TounesHelp Rabbit Chatbot

A charming pink rabbit assistant holding a red heart that helps users navigate the TounesHelpMap platform.

## 🎨 Design Features

### Visual Design
- **Character**: Cute pink rabbit with long ears
- **Symbol**: Holding a red heart (symbolizing compassion and help)
- **Color Scheme**: Pink gradient (from pink-300 to pink-600)
- **Theme**: Warm, friendly, and approachable
- **Position**: Bottom-right corner of the screen (floating)

### Animations
- Pulsing heart effect on the closed button
- Bouncing notification badge
- Typing indicator with animated dots
- Smooth transitions and hover effects
- Scale animation on hover

## 🌐 Multi-Language Support

The chatbot supports 3 languages with automatic RTL (Right-to-Left) support:

1. **French (🇫🇷 Français)** - Default
2. **Arabic (🇹🇳 العربية)** - With RTL support
3. **English (🇬🇧 English)**

Users can switch languages using the globe icon in the chat header.

## 💬 Chatbot Capabilities

### Quick Questions
When the chat first opens, users see 4 suggested questions:
- How to register?
- How to create a case?
- View active cases
- Check case status

### Knowledge Base Topics

#### 1. **Platform Information**
- What is TounesHelpMap
- How the platform works
- General help and guidance

#### 2. **User Registration**
Keywords: `inscr`, `سجل`, `register`, `compte`, `حساب`
- Step-by-step registration guide
- Account creation process
- Link to registration page

#### 3. **Case Creation**
Keywords: `créer`, `cas`, `أنشئ`, `حالة`, `create`, `case`, `signaler`
- How to submit a new case
- Required information
- Submission process
- Link to case creation form

#### 4. **Active Cases & Statistics**
Keywords: `actif`, `voir`, `نشط`, `عرض`, `active`, `view`, `statist`
- Real-time case statistics
- Cases by status (Suffering, Being helped, Resolved)
- Total case count
- Links to view all cases

#### 5. **Specific Case Status**
Format: `#123`, `cas 123`, `حالة 123`, `case 123`
- Check status of a specific case by ID
- Case details (title, location, category)
- Current status with emoji indicators:
  - 🔴 Still suffering
  - 🟠 Being helped
  - 🟢 Resolved
- Link to case details page

#### 6. **Cases by Category**
- **Medical Cases**: Keywords `médical`, `medical`, `طبي`, `santé`, `صحة`
- **Education Cases**: Keywords `éducation`, `education`, `تعليم`, `école`, `مدرسة`
- Shows top 3 cases in each category
- Total count per category

## 🎯 Key Features

### Intelligent Responses
- Context-aware answers based on keywords
- Multi-language detection
- Dynamic data from real cases
- Helpful links to relevant pages

### User Experience
- **Minimizable**: Click to minimize without closing
- **Closeable**: Full close option
- **Reopenable**: Notification badge attracts attention
- **Mobile Responsive**: Works on all screen sizes
- **RTL Support**: Proper layout for Arabic

### Visual Feedback
- Typing indicator while bot is "thinking"
- Message timestamps
- Color-coded message bubbles:
  - User: Red (matching TounesHelp brand)
  - Bot: Pink (matching rabbit theme)
- Decorative floating hearts

## 🚀 Usage

### Automatic Integration
The chatbot is automatically added to all pages via the main App component:

```tsx
// Already integrated in /src/app/App.tsx
import { RabbitChatbot } from "./components/touneshelp/RabbitChatbot";

<RabbitChatbot />
```

### Manual Integration (if needed)
```tsx
import { RabbitChatbot } from './components/touneshelp/RabbitChatbot';

function YourComponent() {
  return (
    <div>
      {/* Your content */}
      <RabbitChatbot />
    </div>
  );
}
```

## 📱 Responsive Behavior

| Screen Size | Behavior |
|-------------|----------|
| Desktop | Full-width chat (400px) positioned bottom-right |
| Tablet | Same as desktop |
| Mobile | Adjusted width to fit screen with padding |

## 🎨 Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Rabbit Background | Pink 300-400 | Main rabbit button gradient |
| Header | Pink 400-600 | Chat header gradient |
| User Messages | #C0392B (TounesHelp Red) | User message bubbles |
| Bot Messages | Pink 100 | Bot message bubbles |
| Heart | Red 500 | Floating hearts decoration |
| Border | Pink 200 | Chat window border |

## 💡 Example Conversations

### Checking a Case Status
```
User: #2847
Bot: 📋 Case #2847: Urgence médicale...
     🔴 Status: Souffre encore
     📍 Location: Tunis
     🏷️ Category: Médical
     
     This case needs urgent help!
     → View case
```

### Getting Statistics
```
User: Show me active cases
Bot: 📊 Currently on TounesHelp:
     🔴 45 suffering cases
     🟠 23 cases being helped
     🟢 67 resolved cases
     
     📍 Total: 135 cases
     
     Would you like to see cases by category or governorate?
     → View all cases
```

### Registration Help
```
User: How to register?
Bot: To register on TounesHelp:
     1️⃣ Click 'Login' at top right
     2️⃣ Select 'Create account'
     3️⃣ Fill in your information (name, email, phone)
     4️⃣ Choose your role (Person in need, Volunteer, NGO)
     5️⃣ Verify your email
     
     ✨ It's free and quick!
     → Register now
```

## 🔧 Customization

### Changing the Greeting Message
Edit `/src/app/components/touneshelp/RabbitChatbot.tsx`:

```tsx
const translations = {
  fr: {
    greeting: "Your custom greeting here! 🐰💕",
    // ...
  }
}
```

### Adding New Knowledge
Add to the `knowledgeBase` object:

```tsx
const knowledgeBase = {
  fr: {
    yourTopic: {
      response: "Your response here",
      links: [{ text: "Link text", url: "/your-url" }]
    }
  }
}
```

### Updating the Bot Response Logic
Modify the `getBotResponse` function to add new keyword detection:

```tsx
function getBotResponse(userMessage: string, language: Language) {
  // Add your custom logic
  if (normalizedMessage.includes('your-keyword')) {
    return kb.yourTopic;
  }
}
```

## 🌟 Special Features

### Real-Time Case Data
The chatbot pulls real-time statistics from the actual case data:
- Live case counts
- Dynamic governorate information
- Real case titles and details

### Contextual Links
Every response includes helpful links to:
- Registration page
- Case creation form
- Case listing page
- Specific case details
- Category filters

### Personalization
The chatbot has a name: **Espoir** (Hope)
- French: Espoir
- Arabic: أمل (Amal)
- English: Hope (but keeps "Espoir" for brand consistency)

## 🎭 Character Personality

Espoir is designed to be:
- **Friendly**: Uses emojis and warm language
- **Helpful**: Provides clear, step-by-step guidance
- **Quick**: Fast responses with typing indicators
- **Compassionate**: Reflects the TounesHelp mission
- **Professional**: Accurate information about the platform

## 📊 Analytics (Future Enhancement)

Potential metrics to track:
- Most asked questions
- Language preferences
- User engagement rate
- Successful case status checks
- Conversion to registration/case creation

## 🔐 Privacy

The chatbot:
- ✅ Runs entirely client-side
- ✅ No data collection
- ✅ No external API calls
- ✅ No user tracking
- ✅ All interactions are private

## 🎉 Easter Eggs

- Hearts animate and float in the background
- The rabbit "bounces" on hover
- Typing indicators have staggered animations
- Different heart sizes for visual interest

---

**Made with 💕 by Espoir for TounesHelp Map**

*"Because every person deserves hope, compassion, and help."*
