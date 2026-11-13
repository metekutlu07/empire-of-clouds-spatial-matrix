# Empire of Clouds · Spatial Matrix

A standalone, static camera-overlay art prototype for iOS Safari and Android Chrome. Based on the original `index.js` glyph alphabet of *Empire of Clouds*.

## Deploy on Netlify

1. Create a NEW GitHub repository named `empire-of-clouds-spatial-matrix` and upload the contents of this folder to its root. Do not put the folder itself inside the repo.
2. In Netlify, choose **Add new project > Import an existing project > GitHub**. Pick this repo.
3. Base directory: blank. Build command: blank. Publish directory: `.`. Click Deploy.
4. Open the resulting `https://YOUR-SITE.netlify.app/` in Safari (iOS) or Chrome (Android), not inside a messenger/webview.
5. First open `/camera-test.html`, check secure context and camera feed. Then use the main page.

## Troubleshooting

- Use a real HTTPS address. Local `file://`, embedded file previews, and some in-app browsers disable camera access.
- Camera must be granted permission when prompted.
- Some networks or Android browsers restrict camera access or motion sensors.
- Camera test includes error name and status, enabling precise diagnosis.
- Demo mode works with no camera.

## Scope

This is **camera-overlay AR**, not WebXR positional tracking or anchor-based AR. No data is uploaded; camera frames remain in the device's browser. No external JS libraries.
