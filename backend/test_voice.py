import speech_recognition as sr

recognizer = sr.Recognizer()

print("Starting microphone test...")

try:
    with sr.Microphone(device_index=1) as source:
        print("Adjusting noise...")
        recognizer.adjust_for_ambient_noise(source, duration=1)

        print("Speak something...")
        audio = recognizer.listen(source, timeout=5)

    print("Processing...")

    text = recognizer.recognize_google(audio)

    print("You said:", text)

except sr.WaitTimeoutError:
    print("❌ No voice detected")

except sr.UnknownValueError:
    print("❌ Could not understand audio")

except sr.RequestError as e:
    print("❌ Google API error:", e)

except Exception as e:
    print("❌ Other error:", repr(e))