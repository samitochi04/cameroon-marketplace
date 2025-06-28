import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsConditionsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t("legal.terms_conditions_title")}</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>Bienvenue sur Cameroon Marketplace. Les présentes Conditions Générales d'Utilisation régissent votre utilisation de notre site web et de tous les services associés. En accédant à notre plateforme, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Définitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>"Plateforme" désigne le site web Cameroon Marketplace.</li>
            <li>"Utilisateur" désigne toute personne qui accède à la Plateforme.</li>
            <li>"Client" désigne un Utilisateur qui achète des produits sur la Plateforme.</li>
            <li>"Vendeur" désigne un Utilisateur qui vend des produits sur la Plateforme.</li>
            <li>"Contenu" désigne tous les textes, images, vidéos et autres matériels publiés sur la Plateforme.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Inscription et Compte</h2>
          <p>Pour utiliser certaines fonctionnalités de la Plateforme, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.</p>
          <p>Lors de l'inscription, vous vous engagez à fournir des informations véridiques, exactes, actuelles et complètes. Nous nous réservons le droit de suspendre ou de résilier votre compte si nous avons des raisons de croire que les informations fournies sont fausses.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Protection des Données Personnelles</h2>
          <p>Nous accordons une grande importance à la protection de vos données personnelles. Nos pratiques en matière de collecte, d'utilisation et de divulgation de vos informations sont décrites dans notre Politique de Confidentialité.</p>
          <p>En utilisant notre Plateforme, vous consentez à la collecte et à l'utilisation de vos informations conformément à notre Politique de Confidentialité.</p>
          <p>Les données personnelles que nous collectons incluent :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informations d'identification (nom, prénom, adresse email)</li>
            <li>Informations de contact (adresse postale, numéro de téléphone)</li>
            <li>Informations de paiement (uniquement pour faciliter les transactions)</li>
            <li>Données de navigation (cookies, adresse IP)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Achats et Paiements</h2>
          <p>En tant que Client, vous pouvez acheter des produits proposés par les Vendeurs sur notre Plateforme. Les prix des produits sont indiqués en Francs CFA (XAF) et incluent toutes les taxes applicables.</p>
          <p>Nous proposons plusieurs méthodes de paiement, notamment le paiement par mobile money. Toutes les transactions sont sécurisées et vos informations de paiement ne sont pas stockées sur notre Plateforme.</p>
          <p>Une fois votre commande passée et payée, vous recevrez une confirmation de commande par email. Les Vendeurs sont responsables de l'expédition des produits et du respect des délais de livraison indiqués.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Responsabilités des Vendeurs</h2>
          <p>En tant que Vendeur, vous êtes responsable de :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fournir des informations exactes et complètes sur vos produits</li>
            <li>Respecter les lois et réglementations applicables, notamment en matière de commerce électronique</li>
            <li>Expédier les produits dans les délais indiqués</li>
            <li>Traiter les retours et remboursements conformément à notre politique de retour</li>
            <li>Répondre aux demandes des Clients dans un délai raisonnable</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Utilisation de la Plateforme</h2>
          <p>Vous vous engagez à utiliser la Plateforme conformément aux présentes Conditions Générales d'Utilisation et à toutes les lois et réglementations applicables.</p>
          <p>Il vous est interdit de :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utiliser la Plateforme à des fins illégales ou non autorisées</li>
            <li>Publier du contenu diffamatoire, obscène, injurieux ou menaçant</li>
            <li>Tenter d'accéder à des parties non publiques de la Plateforme</li>
            <li>Utiliser des robots, des scrapers ou d'autres moyens automatisés pour accéder à la Plateforme</li>
            <li>Interférer avec le fonctionnement normal de la Plateforme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Propriété Intellectuelle</h2>
          <p>La Plateforme et tout son contenu, y compris mais sans s'y limiter, les textes, graphiques, logos, icônes, images, clips audio, téléchargements numériques et compilations de données, sont la propriété de Cameroon Marketplace ou de ses fournisseurs de contenu et sont protégés par les lois camerounaises et internationales sur la propriété intellectuelle.</p>
          <p>Vous ne pouvez pas utiliser, copier, reproduire, distribuer, transmettre, diffuser, afficher, vendre, concéder sous licence ou exploiter de quelque façon que ce soit tout contenu de la Plateforme sans notre consentement écrit préalable.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation de Responsabilité</h2>
          <p>Cameroon Marketplace ne peut être tenu responsable des dommages directs, indirects, accessoires, consécutifs ou punitifs résultant de votre utilisation ou de votre incapacité à utiliser la Plateforme.</p>
          <p>Nous ne garantissons pas que la Plateforme sera ininterrompue, sécurisée ou exempte d'erreurs. Vous utilisez la Plateforme à vos propres risques.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Modifications des Conditions</h2>
          <p>Nous nous réservons le droit de modifier ces Conditions Générales d'Utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur la Plateforme. Il est de votre responsabilité de consulter régulièrement ces Conditions Générales d'Utilisation pour vous tenir informé des modifications.</p>
          <p>En continuant à utiliser la Plateforme après la publication des modifications, vous acceptez d'être lié par les Conditions Générales d'Utilisation modifiées.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Loi Applicable et Juridiction</h2>
          <p>Les présentes Conditions Générales d'Utilisation sont régies par les lois du Cameroun. Tout litige découlant de ou lié à ces Conditions Générales d'Utilisation sera soumis à la juridiction exclusive des tribunaux de Yaoundé, Cameroun.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
          <p>Si vous avez des questions concernant ces Conditions Générales d'Utilisation, veuillez nous contacter à l'adresse suivante : contact@cameroon-marketplace.com</p>
        </section>

        <p className="mt-8 text-sm text-gray-600">Dernière mise à jour : 28 juin 2025</p>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
