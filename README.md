# Full-Stack E-Commerce Website (SHOP.CO)

A full-stack e-commerce website built with React (Vite) on the frontend and Express.js on the
backend, using JSON files for data storage. Based on the "E-commerce Website Template (Freebie)"
Figma design.

## Live Demo

- **Vercel Deployment**: [https://e-commers-website.vercel.app](https://e-commers-website.vercel.app)

## Stack

- **Frontend**: React 19 (Vite), React Router
- **Backend**: Express.js
- **Data storage**: JSON files (`server/data/*.json`) — no database
- **Auth**: Signup only, passwords hashed with bcrypt

## Project structure

```
client/   React frontend (Vite)
server/   Express backend + JSON data
```

## Features

- Homepage (hero, new arrivals, top selling, dress styles, testimonials, newsletter)
- Category/shop page with filters (type, price, size, dress style), sorting, pagination
- Product detail page (gallery, colors/sizes, reviews, related products)
- Cart (add/update/remove, promo code, order summary)
- Signup (JSON-backed, bcrypt password hashing)
- Fully responsive (mobile/tablet/desktop)

## Running locally

### Backend

```bash
cd server
npm install
npm run dev   # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

Copy `client/.env.example` to `client/.env` and adjust `VITE_API_URL` if the backend runs
elsewhere.

## API overview

| Method | Endpoint                      | Description                  |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/products`                | List products (filters, sort, pagination) |
| GET    | `/api/products/:id`            | Single product                |
| GET    | `/api/products/:id/reviews`    | Reviews for a product         |
| POST   | `/api/products/:id/reviews`    | Add a review                  |
| GET    | `/api/dress-styles`            | Dress style categories        |
| GET    | `/api/testimonials`            | Homepage testimonials         |
| GET/POST/PUT/DELETE | `/api/cart`       | Cart management               |
| POST   | `/api/auth/signup`             | Create account                |
