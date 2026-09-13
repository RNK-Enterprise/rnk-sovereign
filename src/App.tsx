import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Offers } from "./pages/Offers";
import { OfferDetail } from "./pages/OfferDetail";
import { Work } from "./pages/Work";
import { Family } from "./pages/Family";
import { Podcast } from "./pages/Podcast";
import { Jenn } from "./pages/Jenn";
import { Process } from "./pages/Process";
import { Contact } from "./pages/Contact";
import { Book } from "./pages/Book";
import { Pricing } from "./pages/Pricing";
import { Shop } from "./pages/Shop";
import { Product } from "./pages/Product";
import { Checkout } from "./pages/Checkout";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="offers" element={<Offers />} />
        <Route path="offers/:slug" element={<OfferDetail />} />
        <Route path="work" element={<Work />} />
        <Route path="family" element={<Family />} />
        <Route path="work/jenn" element={<Jenn />} />
        <Route path="podcast" element={<Podcast />} />
        <Route path="work/the-veil" element={<Navigate to="/podcast" replace />} />
        <Route path="work/cline" element={<Navigate to="/work" replace />} />
        <Route path="work/drew" element={<Navigate to="/work" replace />} />
        <Route path="process" element={<Process />} />
        <Route path="contact" element={<Contact />} />
        <Route path="book" element={<Book />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/checkout" element={<Checkout />} />
        <Route path="shop/:slug" element={<Product />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="foundry" element={<Navigate to="/work" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
