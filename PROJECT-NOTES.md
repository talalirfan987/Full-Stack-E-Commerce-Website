# SHOP.CO — Project Explanation (Assignment Notes)

## 1. Project kya hai?

Ek **full-stack e-commerce website** hai, Figma design (SHOP.CO template) ke upar based.
- **Frontend**: React (Vite)
- **Backend**: Express.js
- **Database ki jagah**: JSON files (`server/data/*.json`) — koi MongoDB/MySQL nahi
- **Deployment**: Frontend Vercel pe, Backend Render pe

---

## 2. Folder Structure (aur kyun aise banaya)

```
Full-Stack-E-Commerce-Website/
├── client/                  ← React frontend (poora alag app)
│   ├── src/
│   │   ├── components/      ← reusable UI pieces (Navbar, ProductCard, Footer...)
│   │   ├── pages/           ← full pages (Home, Cart, Category, ProductDetail, Login, Signup)
│   │   ├── context/         ← AuthContext (login state pura app mein share hota hai)
│   │   ├── api/             ← api.js — saare backend calls yahan se hote hain
│   │   └── App.jsx          ← routes define hote hain
│   └── package.json
│
└── server/                  ← Express backend (poora alag app)
    ├── server.js            ← entry point, sab routes yahan mount hote hain
    ├── routes/               ← har feature ka apna file (products, cart, auth, reviews...)
    ├── data/                 ← JSON "database"
    ├── utils/jsonStore.js    ← JSON read/write karne ka helper function
    └── package.json
```

**Why separate client/server?** — Ye industry-standard pattern hai (MERN-style). Frontend aur
backend do independent apps hain jo REST API se baat karte hain. Isse har part alag se develop,
test aur deploy ho sakta hai.

**Why routes/ folder aur ek file nahi?** — Agar sab kuch ek file mein hota to 500+ lines ka
mess ban jata. Har route file sirf apna kaam karta hai (single responsibility) — `products.js`
sirf products ka logic rakhta hai, `cart.js` sirf cart ka. Ye maintainable aur readable code hai.

---

## 3. Pages (Frontend Routes)

| Route | Page | Kya karta hai |
|---|---|---|
| `/` | Home | Hero, New Arrivals, Top Selling, Dress Styles, Testimonials |
| `/shop`, `/category/:slug` | Category | Filters (type/price/size), sort, pagination |
| `/product/:id` | Product Detail | Gallery, colors/sizes, reviews, related products |
| `/cart` | Cart | Add/remove/update quantity, promo code, order summary |
| `/signup` | Signup | Account banane ka form |
| `/login` | Login | Existing account se login |
| `/admin` | Admin Portal | Live orders dashboard (customer details, address, items, status update, delete) & products management |

---

## 4. Backend API (Express Routes)

| Method | Endpoint | Kaam |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/products` | Sab products (filter/sort/crud) |
| GET | `/api/products/:id` | Ek product ki detail |
| GET/POST | `/api/products/:id/reviews` | Reviews dekhna/dalna |
| GET/POST/PUT/DELETE | `/api/cart` | Cart manage karna |
| GET/POST/PUT/DELETE | `/api/orders` | Orders place karna, list karna, status update karna (`PUT /:id/status`), aur delete karna (`DELETE /:id`) |
| POST | `/api/auth/signup` | Naya account banana |
| POST | `/api/auth/login` | Login karna |
| GET | `/api/dress-styles`, `/api/testimonials` | Static homepage data |

**Data flow**: Frontend (`api.js`) → `fetch()` call → Express route → JSON file read/write
(`utils/jsonStore.js`) → response wapas frontend ko.

---

## 5. Authentication kaise kaam karta hai

- Signup: `name/email/password` form → backend password ko **bcrypt se hash** karta hai
  (plaintext kabhi save nahi hota) → `users.json` mein save.
- Login: email/password backend ko jaata hai → bcrypt se hash compare hota hai → match hone pe
  user data wapas milta hai.
- Frontend: `AuthContext` (React Context API) user ko `localStorage` mein rakhta hai, isliye
  refresh karne pe bhi login state yaad rehta hai. Login hone ke baad Navbar mein profile
  (naam + avatar) dikhta hai, promo bar hide ho jata hai.
- **Session/JWT nahi use kiya** — ye ek simple client-side "remembered" state hai, production-grade
  auth nahi (assignment scope ke hisaab se kaafi hai).

---

## 6. React Concepts jo use hue (agar poochein)

- **Components & Props**: Har UI piece (Navbar, ProductCard, Footer) apna component hai, data
  props se pass hota hai (e.g. `<ProductCard product={product} />`)
- **JSX**: Sab UI JSX mein likha hai (`.jsx` files)
- **State**: `useState` — form inputs, filters, cart quantities, dropdown open/close
- **Effects**: `useEffect` — page load hote hi backend se data fetch karna (products, cart, reviews)
- **Context API**: `AuthContext` — login state pura app share karta hai bina props drilling ke
- **Conditional Rendering**: Loading/error states, logged-in vs logged-out Navbar
- **Lists & Keys**: `.map()` se products/reviews render hote hain, har ek ko unique `key`
- **React Router**: Client-side routing, ek hi Navbar rehta hai, sirf page content change hota hai

---

## 7. Common Assignment/Viva Questions — Achhe Jawab

**Q: Database kyun use nahi kiya?**
A: Assignment requirement thi Express JSON files se data manage karna, isliye MongoDB/MySQL ki
jagah `server/data/*.json` files use ki hain, jinko `fs` module se read/write karte hain.

**Q: Frontend-backend kaise connected hain?**
A: REST API ke through. Frontend `fetch()` calls karta hai (`client/src/api/api.js` mein
centralized) `http://localhost:5000/api/...` endpoints pe, Express unko handle karke JSON
response deta hai.

**Q: Passwords kaise secure kiye?**
A: `bcryptjs` library se hash kiya jata hai (`bcrypt.hash(password, 10)`), plaintext password
kabhi bhi disk pe save nahi hota. Login pe `bcrypt.compare()` se verify hota hai.

**Q: Responsive kaise banaya?**
A: CSS media queries har component mein hain (`@media (max-width: 768px)` etc.), Flexbox/Grid
layout use kiya jo mobile/tablet/desktop teeno pe adjust hota hai.

**Q: Cart data refresh pe kyun nahi jaata?**
A: Cart backend (`cart.json`) mein save hota hai, sirf browser state mein nahi — isliye server
restart tak persist rehta hai.

**Q: Deploy kahan kiya?**
A: Frontend Vercel pe (static React build), backend Render pe (Express server ke liye chahiye
persistent filesystem jo Vercel serverless functions provide nahi karti).
