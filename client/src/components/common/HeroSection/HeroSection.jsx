import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PropTypes from "prop-types";

export const HeroSection = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage = "/hero-background.jpg",
  height = "h-96",
  showSearch = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      className={`relative w-full ${height} bg-cover bg-center flex items-center justify-center`}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {t("hero_title")}
        </h1>
        <p className="text-lg md:text-xl mb-8">{t("hero_subtitle")}</p>

        {showSearch && (
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={t("search_products")}
                className="w-full py-3 px-12 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-gray-400" size={20} />
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-dark text-white py-1 px-4 rounded-full"
              >
                {t("search")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string.isRequired,
  backgroundImage: PropTypes.string,
  height: PropTypes.string,
  showSearch: PropTypes.bool,
};