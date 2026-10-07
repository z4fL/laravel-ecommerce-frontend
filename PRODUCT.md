# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript front-end, with TanStack Query for server state and generated Orval API clients.

## Users

Primary users are online shoppers who want to discover products, compare options, place an order, and manage the post-purchase experience. The product is shopper-first rather than seller-first.

## Product Purpose

This product is a storefront for a Laravel-backed e-commerce API. It lets shoppers browse a catalog, view product details, manage a cart, complete checkout, and track orders in a simple and trustworthy shopping experience.

## Positioning

This frontend is positioned as a contract-driven, shopper-first commerce experience. The product mechanism is straightforward: catalog browsing, cart management, checkout, and order management, delivered through a web storefront that follows the API contract without inventing unsupported behaviors.

## Operating Context

The app runs in a browser and integrates with the backend at the local development server URL declared in the OpenAPI contract: `http://localhost:8000/api/v1`. Core user flows include registration and login, product discovery, cart updates, shipping address collection, checkout, order history, and profile management.

## Capabilities and Constraints

- Customer authentication and account creation are in scope.
- Product browsing, category browsing, cart operations, checkout preview, and order management are in scope.
- Shipping address creation and payment-related flows are supported by the backend contract.
- Store, seller, and merchant management are present in the API surface, but the confirmed primary product scope for this frontend is shopper experience rather than merchant operations.
- The frontend must use the generated Orval clients and TanStack Query hooks in `src/generated/` as the source of truth for backend behavior.
- Generated files under `src/generated/` are read-only; unsupported behavior must not be invented in the UI.
- The codebase is currently a Vite React app with placeholder routes and no established visual world yet.

## Brand Commitments

No explicit brand identity, logo, voice, or visual direction was provided. No binding brand assets or marketing claims are recorded yet.

## Evidence on Hand

- `docs/api-docs.yaml` defines a REST API E-commerce product and describes the available backend endpoints.
- `src/generated/` contains generated API clients and schema types for authentication, products, categories, cart, checkout, orders, shipping addresses, stores, profile, and tags.
- `src/app/router.tsx` currently contains placeholder routes for Home, Products, Login, and Cart.
- The repository is structured as a React + TypeScript + Vite storefront frontend for a Laravel e-commerce backend.

## Product Principles

- Keep the buying journey clear and trustworthy.
- Build around the API contract instead of inventing backend behavior.
- Favor simple, consistent shopping flows over complexity.
- Keep shopper tasks fast and legible across catalog, cart, checkout, and order stages.

## Accessibility & Inclusion

No product-specific accessibility or inclusion requirements have been confirmed beyond standard accessible commerce interactions and a clear, understandable purchase flow.
