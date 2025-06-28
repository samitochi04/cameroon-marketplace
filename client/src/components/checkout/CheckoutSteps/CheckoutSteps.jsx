import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

export const CheckoutSteps = ({ steps, currentStep }) => {
  // Ensure all steps are strings, not objects
  const safeSteps = steps.map((step) =>
    typeof step === 'object' ? 'Step' : step
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        {safeSteps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step indicator */}
            <div className="relative">
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2
                  ${index < currentStep
                    ? 'bg-primary border-primary text-white'
                    : index === currentStep
                    ? 'border-primary text-primary bg-white'
                    : 'border-gray-300 text-gray-300 bg-white'}
                `}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div
                className={`
                absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                text-xs font-medium
                ${index <= currentStep ? 'text-primary' : 'text-gray-500'}
              `}
              >
                {step}
              </div>
            </div>

            {/* Connector line between steps */}
            {index < safeSteps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2
                  ${index < currentStep ? 'bg-primary' : 'bg-gray-300'}
                `}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Additional margin to account for labels below */}
      <div className="h-6"></div>
    </div>
  );
};

CheckoutSteps.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.node).isRequired,
  currentStep: PropTypes.number.isRequired,
};
