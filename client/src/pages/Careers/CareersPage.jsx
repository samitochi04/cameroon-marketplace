import React from 'react';
import { useTranslation } from 'react-i18next';

const CareersPage = () => {
  const { t } = useTranslation();

  const jobOpenings = [];

  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("careers.competitive_salary"),
      description: t("careers.competitive_salary_desc"),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("careers.health_insurance"),
      description: t("careers.health_insurance_desc"),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t("careers.career_growth"),
      description: t("careers.career_growth_desc"),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("careers.flexible_hours"),
      description: t("careers.flexible_hours_desc"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{t("careers.join_our_team")}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("careers.join_our_team_desc")}</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Why Work With Us */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t("careers.why_work_with_us")}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t("careers.open_positions")}</h2>
          
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{job.department}</span>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{job.location}</span>
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded">{job.type}</span>
                    </div>
                  </div>
                  <button className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition">{t("careers.apply_now")}</button>
                </div>
                <p className="text-gray-600">{job.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CareersPage;
