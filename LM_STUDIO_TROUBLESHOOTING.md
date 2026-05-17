# LM Studio Connection Troubleshooting Guide

If the app isn't connecting to LM Studio, follow this checklist:

## 1. LM Studio Server Setup

- [ ] LM Studio is installed on your MacBook
- [ ] LM Studio application is running (not just installed)
- [ ] A model is downloaded (e.g., Gemma 3 4B, Qwen 2.5)
- [ ] The "Local Server" tab is open
- [ ] The server is started and showing "Server is running"
- [ ] The server URL shows `http://localhost:1234` (or similar)

## 2. Network & Port Check

Open Terminal and run:
```bash
curl -v http://localhost:1234/v1/models
```

Expected: JSON response with available models, HTTP 200 status

If this fails:
- LM Studio server isn't running or listening on port 1234
- Check the LM Studio application's "Local Server" tab

## 3. App Configuration

In the German Tutor app:
1. Go to **Einstellungen** (Settings)
2. Under "LM Studio Verbindung", enter: `http://localhost:1234`
3. Click the refresh button (should say "Modelle gefunden")
4. Select a model from the list below
5. Go to **Gespräch** (Conversation) tab

## 4. Debugging in Browser Console

1. Open your browser's Developer Console (F12 or Cmd+Option+I)
2. Click the Konsole tab
3. Try sending a message
4. Look for errors starting with `[LM Studio]` or `[ConversationView]`

Common errors:
- `Failed to fetch` → LM Studio server not running
- `HTTP 404` → Wrong URL or server not responding
- `AbortError` → Timeout (server took >30 seconds)

## 5. CORS Considerations

If you see "CORS" errors in the console:
- Make sure your Vite dev server and LM Studio are on different ports
- This is normal and expected
- The app handles CORS internally

## 6. Model Selection

After connecting:
- Models should appear under "Modell auswählen"
- Select one (green checkmark shows it's active)
- Recommended for M1: 
  - Gemma-3-4B-Instruct-Q4_K_M
  - Qwen2.5-7B-Instruct-Q4_K_M

## 7. Test Connection

1. Go to **Gespräch** tab
2. Enter text in German in the input box or click the microphone
3. Send a message
4. If the AI responds, it's working!

## If Still Not Working

1. Restart LM Studio
2. Refresh your browser
3. Check the browser console for specific error messages
4. Verify the server URL is correct (http, not https)
5. Try a simple curl test again (step 2)

## Advanced: Check Server Status

```bash
# Check if server is listening
lsof -i :1234

# Check system logs
# On Mac, check Activity Monitor for LM Studio process
```

## Performance Tips for M1

- Use 4-bit quantized models (Q4_K_M)
- Recommended: Gemma 3 4B or Qwen 2.5 7B
- Close other applications to free RAM
- First response may take 30-60 seconds (model loading)

---

If you're still having issues, check the browser console (F12) for error messages with `[LM Studio]` prefix and share those details.
