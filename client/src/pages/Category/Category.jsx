import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import ProductCard from "../../components/ProductCard/ProductCard";
import Pagination from "../../components/Pagination/Pagination";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";
import { getProducts } from "../../api/api";
import Loader from "../../components/Loader/Loader";
import "./Category.css";

const PAGE_SIZE = 9;

function Category() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const onSale = searchParams.get("onSale") === "true";
  const section = searchParams.get("section") || "";
  const typeParam = searchParams.get("type") || "";

  const [filters, setFilters] = useState({
    type: typeParam,
    minPrice: 0,
    maxPrice: 300,
    color: "",
    size: "",
    category: categorySlug || "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState({ products: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const next = { ...filters, category: categorySlug || "", type: typeParam };
    setFilters(next);
    setAppliedFilters(next);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, typeParam, onSale, section]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        const params = {
          maxPrice: appliedFilters.maxPrice,
          page,
          limit: PAGE_SIZE,
        };
        if (appliedFilters.type) params.type = appliedFilters.type;
        if (appliedFilters.category) params.category = appliedFilters.category;
        if (appliedFilters.size) params.size = appliedFilters.size;
        if (sort) params.sort = sort;
        if (onSale) params.onSale = "true";
        if (section) params.section = section;

        const data = await getProducts(params);
        if (cancelled) return;
        setResult(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, sort, page, onSale, section]);

  function handleFilterChange(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  function handleApply() {
    setAppliedFilters(filters);
    setPage(1);
  }

  const categoryLabel = onSale
    ? "On Sale"
    : section === "new-arrivals"
    ? "New Arrivals"
    : categorySlug
    ? categorySlug[0].toUpperCase() + categorySlug.slice(1)
    : "All Products";

  return (
    <>
      <Navbar />
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: categoryLabel }]} />

      <main className="category-page container">
        <div className="category-page__layout">
          <FilterSidebar filters={filters} onChange={handleFilterChange} onApply={handleApply} />

          <div className="category-page__content">
            <div className="category-page__header">
              <h1>{categoryLabel}</h1>

              <div className="category-page__header-right">
                <span className="category-page__count">
                  {result.total > 0
                    ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                        page * PAGE_SIZE,
                        result.total
                      )} of ${result.total} Products`
                    : "No products found"}
                </span>

                <label className="category-page__sort">
                  Sort by:
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </label>
              </div>
            </div>

            {loading && <Loader label="Loading product catalog..." />}
            {error && <p className="category-page__status">Couldn't load products.</p>}

            {!loading && !error && (
              <>
                <div className="category-page__grid">
                  {result.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </>
  );
}

export default Category;
