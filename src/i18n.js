import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Environment variable for development
const isDev = import.meta.env.DEV;

i18n
  // Load translations from backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    debug: isDev,
    
    // Define namespaces
    ns: ['common'],
    defaultNS: 'common',
    
    backend: {
      // Path to load language files
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    
    // Fallback translations in case files don't load
    // These should match the keys used in your components
    resources: {
      en: {
        common: {
          welcome: 'Welcome to Cameroon Marketplace',
          tagline: 'The best multi-vendor platform in Cameroon',
          login: 'Login',
          signup: 'Sign Up',
          search: 'Search products...',
          discover_quality_products: 'Discover Quality Products',
          hero_subtitle: 'Find the best products from local vendors',
          shop_now: 'Shop Now',
          featured_products: 'Featured Products',
          view_all: 'View All',
          error_loading_products: 'Error loading products',
          shop_by_category: 'Shop by Category',
          all_categories: 'All Categories',
          top_vendors: 'Top Vendors',
          all_vendors: 'All Vendors',
          products: 'Products',
          special_offers: 'Special Offers',
          special_offer_title: 'Limited Time Offer',
          special_offer_description: 'Get amazing deals on selected products for a limited time.'
        }
      },
      fr: {
        common: {
          welcome: 'Bienvenue sur Cameroon Marketplace',
          tagline: 'La meilleure plateforme multi-vendeurs au Cameroun',
          login: 'Se connecter',
          signup: 'S\'inscrire',
          search: 'Rechercher des produits...',
          discover_quality_products: 'Découvrez des Produits de Qualité',
          hero_subtitle: 'Trouvez les meilleurs produits des vendeurs locaux',
          shop_now: 'Acheter Maintenant',
          featured_products: 'Produits en Vedette',
          view_all: 'Voir Tout',
          error_loading_products: 'Erreur lors du chargement des produits',
          shop_by_category: 'Acheter par Catégorie',
          all_categories: 'Toutes les Catégories',
          top_vendors: 'Meilleurs Vendeurs',
          all_vendors: 'Tous les Vendeurs',
          products: 'Produits',
          special_offers: 'Offres Spéciales',
          special_offer_title: 'Offre à Durée Limitée',
          special_offer_description: 'Obtenez des offres incroyables sur des produits sélectionnés pour un temps limité.'
        }
      }
    }
  });

export default i18n;
