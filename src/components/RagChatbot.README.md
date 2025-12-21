# RagChatbot Component

The RagChatbot component adds AI-powered text selection functionality to the Docusaurus documentation site.

## Features

- **Text Selection Detection**: Automatically detects when users select text on any page
- **Floating Button**: Shows an "Ask AI" button near the selected text
- **API Integration**: Sends selected text to the `/rag-query` endpoint
- **Modal Response**: Displays AI responses in a clean modal interface
- **Responsive Design**: Works across all device sizes

## How It Works

1. User selects text on any documentation page
2. An "Ask AI" button appears near the selection
3. When clicked, the selected text is sent to the `/rag-query` API endpoint
4. The AI response is displayed in a modal overlay
5. Users can close the modal to continue reading

## Implementation Details

- **Location**: `src/components/RagChatbot.js`
- **Integration**: Added via `src/theme/Root.js` to all pages
- **Dependencies**: React, ReactDOM, and standard browser APIs
- **Styling**: CSS-in-JS with responsive design

## Files

- `src/components/RagChatbot.js` - Main component implementation
- `src/theme/Root.js` - Global integration
- `docs/test-ragchatbot.md` - Test page for functionality

## API Integration

The component makes POST requests to `/rag-query` with the following payload:
```json
{
  "query": "selected text content"
}
```

The response should contain a `response` or `answer` field with the AI-generated content.