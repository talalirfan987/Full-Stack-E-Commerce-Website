import "./Loader.css";

function Loader({ fullPage = false, label = "Loading, please wait..." }) {
  return (
    <div className={`loader-container ${fullPage ? "loader-container--full" : ""}`}>
      <div className="loader-card">
        <div className="loader-brand">SHOP.CO</div>
        <div className="loader-spinner-wrapper">
          <div className="loader-spinner" />
        </div>
        <p className="loader-label">{label}</p>
      </div>
    </div>
  );
}

export default Loader;
