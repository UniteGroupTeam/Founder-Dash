# FounderDash · Bottle Code

> Tu infraestructura de negocio. Datos reales, decisiones inteligentes.

PWA de ventas y analytics construida con Google Sheets + Apps Script + Chart.js.

---

## 🚀 Publicar en GitHub Pages (paso a paso)

### 1. Crear el repositorio en GitHub
1. Ve a [github.com](https://github.com) → **New repository**
2. Nombre sugerido: `founderdash`
3. Deja marcado **Public**
4. **No** inicialices con README (ya existe)
5. Clic en **Create repository**

### 2. Subir el código desde tu PC

Abre PowerShell en la carpeta `founderdash` y ejecuta:

```powershell
git init
git add .
git commit -m "feat: FounderDash v1.0 - launch"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/founderdash.git
git push -u origin main
```

> Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### 3. Activar GitHub Pages
1. En tu repositorio → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Clic en **Save**
5. En ~2 minutos tu sitio estará en:  
   `https://TU_USUARIO.github.io/founderdash/`

---

## 🛠 Desarrollo local

```powershell
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 📱 Instalación como PWA

- **iPhone**: Safari → compartir → "Añadir a pantalla de inicio"
- **Android**: Chrome → menú → "Instalar aplicación"

---

## 🔗 Links

- Catálogo Bottle Code: [bottle-code-rodricg30-shop.fourthwall.com](https://bottle-code-rodricg30-shop.fourthwall.com/en-mxn)
- Formulario de contacto: [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSfd9l_5vu8OVb9TSTl16I7EckPBataCWLXTbIZeSROiU_p2jQ/viewform)

---

*Made with ❤️ by Bottle Code Agency*
