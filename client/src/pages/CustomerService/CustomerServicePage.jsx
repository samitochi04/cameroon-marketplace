import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CustomerServicePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('help');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      question: t("customer_service.faq_order_status"),
      answer: t("customer_service.faq_order_status_answer"),
    },
    {
      id: 2,
      question: t("customer_service.faq_return_policy"),
      answer: t("customer_service.faq_return_policy_answer"),
    },
    {
      id: 3,
      question: t("customer_service.faq_payment_methods"),
      answer: t("customer_service.faq_payment_methods_answer"),
    },
    {
      id: 4,
      question: t("customer_service.faq_shipping_time"),
      answer: t("customer_service.faq_shipping_time_answer"),
    },
    {
      id: 5,
      question: t("customer_service.faq_account_creation"),
      answer: t("customer_service.faq_account_creation_answer"),
    },
    {
      id: 6,
      question: t("customer_service.faq_vendor_signup"),
      answer: t("customer_service.faq_vendor_signup_answer"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">{t("customer_service.title")}</h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Contact Info Bar */}
        <div className="bg-primary text-white p-4 rounded-lg mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="font-semibold">{t("customer_service.need_help")}</h2>
            <p>{t("customer_service.contact_hours")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:+237123456789" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t("customer_service.call_us")}
            </a>
            <Link to="/contact" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t("customer_service.email_us")}
            </Link>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('help')}
              className={`px-4 py-2 ${activeTab === 'help' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            >
              {t("customer_service.help_center")}
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 ${activeTab === 'faq' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            >
              {t("customer_service.faq")}
            </button>
            <button 
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 ${activeTab === 'contact' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            >
              {t("customer_service.contact")}
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'help' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">{t("customer_service.popular_topics")}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.orders_returns")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.orders_returns_desc")}</p>
                </div>
                
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.shipping_delivery")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.shipping_delivery_desc")}</p>
                </div>
                
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.payment")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.payment_desc")}</p>
                </div>
                
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.account")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.account_desc")}</p>
                </div>
                
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.technical_issues")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.technical_issues_desc")}</p>
                </div>
                
                <div className="border p-4 rounded-md hover:border-primary hover:shadow-md transition cursor-pointer">
                  <h3 className="font-medium mb-2">{t("customer_service.vendor_support")}</h3>
                  <p className="text-sm text-gray-600">{t("customer_service.vendor_support_desc")}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-6">{t("customer_service.guides")}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t("customer_service.new_customer_guide")}</h3>
                      <p className="text-sm text-gray-600 mb-2">{t("customer_service.new_customer_guide_desc")}</p>
                      <a href="#" className="text-primary hover:underline text-sm">{t("customer_service.read_more")}</a>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t("customer_service.payment_guide")}</h3>
                      <p className="text-sm text-gray-600 mb-2">{t("customer_service.payment_guide_desc")}</p>
                      <a href="#" className="text-primary hover:underline text-sm">{t("customer_service.read_more")}</a>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t("customer_service.shopping_guide")}</h3>
                      <p className="text-sm text-gray-600 mb-2">{t("customer_service.shopping_guide_desc")}</p>
                      <a href="#" className="text-primary hover:underline text-sm">{t("customer_service.read_more")}</a>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t("customer_service.return_guide")}</h3>
                      <p className="text-sm text-gray-600 mb-2">{t("customer_service.return_guide_desc")}</p>
                      <a href="#" className="text-primary hover:underline text-sm">{t("customer_service.read_more")}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">{t("customer_service.frequently_asked_questions")}</h2>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border rounded-md">
                    <button
                      className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedFaq === faq.id ? 'transform rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="p-4 pt-0 border-t">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-gray-50 p-6 rounded-md border text-center">
                <h3 className="font-semibold mb-2">{t("customer_service.cant_find_answer")}</h3>
                <p className="text-gray-600 mb-4">{t("customer_service.cant_find_answer_desc")}</p>
                <Link to="/contact" className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
                  {t("customer_service.contact_support")}
                </Link>
              </div>
            </div>
          )}
          
          {activeTab === 'contact' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">{t("customer_service.contact_us")}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-3">{t("customer_service.customer_support")}</h3>
                  <p className="text-gray-600 mb-3">{t("customer_service.customer_support_desc")}</p>
                  <div className="flex items-center gap-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:support@cameroon-marketplace.com" className="hover:underline">support@cameroon-marketplace.com</a>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-3">{t("customer_service.sales_inquiries")}</h3>
                  <p className="text-gray-600 mb-3">{t("customer_service.sales_inquiries_desc")}</p>
                  <div className="flex items-center gap-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:sales@cameroon-marketplace.com" className="hover:underline">sales@cameroon-marketplace.com</a>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-3">{t("customer_service.vendor_support")}</h3>
                  <p className="text-gray-600 mb-3">{t("customer_service.vendor_support_contact_desc")}</p>
                  <div className="flex items-center gap-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:vendors@cameroon-marketplace.com" className="hover:underline">vendors@cameroon-marketplace.com</a>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-3">{t("customer_service.phone_support")}</h3>
                  <p className="text-gray-600 mb-3">{t("customer_service.phone_support_desc")}</p>
                  <div className="flex items-center gap-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+237123456789" className="hover:underline">+237 123 456 789</a>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link to="/contact" className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
                  {t("customer_service.go_to_contact_page")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServicePage;
