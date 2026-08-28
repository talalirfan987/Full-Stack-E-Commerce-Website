import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import ProductSection from "../../components/ProductSection/ProductSection";
import DressStyle from "../../components/DressStyle/DressStyle";
import Testimonials from "../../components/Testimonials/Testimonials";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";
import { getProducts, getDressStyles, getTestimonials } from "../../api/api";
import Loader from "../../components/Loader/Loader";

function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [dressStyles, setDressStyles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        setLoading(true);
        const [arrivals, selling, styles, reviews] = await Promise.all([
          getProducts({ section: "new-arrivals" }),
          getProducts({ section: "top-selling" }),
          getDressStyles(),
          getTestimonials(),
        ]);

        if (cancelled) return;
        setNewArrivals(arrivals.products);
        setTopSelling(selling.products);
        setDressStyles(styles);
        setTestimonials(reviews);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {loading && <Loader fullPage={true} label="Loading SHOP.CO..." />}
      <Navbar />
      <Hero />
      <ProductSection
        id="new-arrivals"
        title="New Arrivals"
        products={newArrivals}
        loading={loading}
        error={error}
      />
      <div className="container">
        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />
      </div>
      <ProductSection
        id="top-selling"
        title="Top Selling"
        products={topSelling}
        loading={loading}
        error={error}
      />
      {dressStyles.length > 0 && <DressStyle styles={dressStyles} />}
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
      <Newsletter />
      <Footer />
    </>
  );
}

export default Home;
