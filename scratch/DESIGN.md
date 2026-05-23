# Design System Strategy: BooklySharp Landing Page 2.0

## 1. Overview & Creative North Star
The Creative North Star for the BooklySharp landing page is **"Hyper-Efficient Elegance."**
BooklySharp is a modern, high-performance booking platform for salons, therapists, and freelancers. It must look extremely premium, sophisticated, dynamic, and reliable. The aesthetic blends a deep slate background for the hero section with sterile, clean white surfaces for details, paired with a royal blue gradient for focal points and interactive buttons.

## 2. Colors & Surface Architecture
Our color palette centers around a professional royal blue combined with high-contrast text and clean containers.

### Colors
* **Primary (Theme-500):** `#004ac6` (Royal Blue)
* **Primary Container (Theme-600):** `#2563eb` (Indigo Blue)
* **Accent (Theme-700):** `#0c63ce` (CTA Accent Blue)
* **Background (Dark):** `#090d16` (Deep Navy / Slate-950)
* **Background (Light):** `#faf8ff` / `#f8fafc` (Slate-50)
* **Surface:** `#ffffff` (Pure White)
* **Text (Light):** `#f8fafc` (Slate-50)
* **Text (Dark):** `#0f172a` (Slate-900)
* **Text Muted:** `#64748b` (Slate-500)

### Border & Elevation
We use very subtle dividers:
* **Grid borders:** `rgba(172,179,183,0.08)`
* **Ghost borders:** `rgba(172,179,183,0.15)`
* **Standard Shadows:** Ambient, diffuse shadows using `#004ac6` at 5% opacity for active elements.

## 3. Typography: Editorial & Geometric
We use a modern geometric font duo:
* **Display & Headlines (Plus Jakarta Sans):** Geometric, bold, modern.
* **Body & Labels (Inter):** Highly legible, clean, professional.

## 4. Components & Interactive States
* **Primary CTAs:** Royal blue gradients (`linear-gradient(135deg, #004ac6 0%, #2563eb 100%)`) with smooth hovers.
* **Feature Cards:** Clean borders (`border-slate-100`), subtle rounded corners (`1rem / 16px`), custom colored icon wells.
