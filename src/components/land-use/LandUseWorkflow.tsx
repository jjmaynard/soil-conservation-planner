import React, { useState } from 'react';
import { LandTypeSelector } from './LandTypeSelector';
import { UseCaseSelector } from './UseCaseSelector';
import { UseCaseQuickStart } from './UseCaseQuickStart';
import { getCurrentSession, saveCurrentSession, createNewSession } from '@/lib/storage/browser-storage';
import { getLandType } from '@/config/land-types';

type WorkflowStep = 'land-type' | 'use-case' | 'field-selection' | 'analysis';

interface LandUseWorkflowProps {
  onAnalysisStart?: (session: any) => void;
}

export function LandUseWorkflow({ onAnalysisStart }: LandUseWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('land-type');
  const [selectedLandType, setSelectedLandType] = useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(true);

  // Handle quick start selection
  const handleQuickStart = (landTypeId: string, useCaseId: string) => {
    setSelectedLandType(landTypeId);
    setSelectedUseCase(useCaseId);
    setShowQuickStart(false);
    
    // Track recent use case
    const { addRecentUseCase } = require('@/lib/use-case-utils');
    addRecentUseCase(useCaseId, landTypeId);
    
    // Create session and advance
    const session = createNewSession(landTypeId, useCaseId, null);
    saveCurrentSession(session);
    
    if (onAnalysisStart) {
      onAnalysisStart(session);
    }
    
    setCurrentStep('field-selection');
  };

  // Handle land type selection
  const handleLandTypeSelect = (landTypeId: string) => {
    setSelectedLandType(landTypeId);
    setShowQuickStart(false);
    // Auto-advance to use case selection
    setTimeout(() => setCurrentStep('use-case'), 300);
  };

  // Handle use case selection
  const handleUseCaseSelect = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
    
    // Track recent use case selection
    if (selectedLandType) {
      const { addRecentUseCase } = require('@/lib/use-case-utils');
      addRecentUseCase(useCaseId, selectedLandType);
    }
    
    // Create new analysis session (field geometry will be added in Phase 4)
    if (selectedLandType) {
      const session = createNewSession(selectedLandType, useCaseId, null);
      saveCurrentSession(session);
      
      // Notify parent component
      if (onAnalysisStart) {
        onAnalysisStart(session);
      }
      
      // Advance to field selection
      setCurrentStep('field-selection');
    }
  };

  // Navigation helpers
  const goBack = () => {
    if (currentStep === 'use-case') {
      setCurrentStep('land-type');
      setSelectedUseCase(null);
    } else if (currentStep === 'field-selection') {
      setCurrentStep('use-case');
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('land-type');
    setSelectedLandType(null);
    setSelectedUseCase(null);
    setShowQuickStart(true);
  };

  return (
    <div className="land-use-workflow min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Quick Start Section - Only show at beginning */}
        {currentStep === 'land-type' && showQuickStart && (
          <UseCaseQuickStart onStartAnalysis={handleQuickStart} />
        )}
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <StepIndicator 
              number={1} 
              label="Land Type" 
              isActive={currentStep === 'land-type'}
              isCompleted={selectedLandType !== null}
            />
            <div className="w-12 h-0.5 bg-gray-300" />
            <StepIndicator 
              number={2} 
              label="Use Case" 
              isActive={currentStep === 'use-case'}
              isCompleted={selectedUseCase !== null}
            />
            <div className="w-12 h-0.5 bg-gray-300" />
            <StepIndicator 
              number={3} 
              label="Field Selection" 
              isActive={currentStep === 'field-selection'}
              isCompleted={false}
            />
            <div className="w-12 h-0.5 bg-gray-300" />
            <StepIndicator 
              number={4} 
              label="Analysis" 
              isActive={currentStep === 'analysis'}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Back Button */}
        {currentStep !== 'land-type' && (
          <button
            onClick={goBack}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 'land-type' && (
            <LandTypeSelector 
              onSelect={handleLandTypeSelect}
              selectedLandType={selectedLandType}
            />
          )}

          {currentStep === 'use-case' && selectedLandType && (
            <UseCaseSelector
              landTypeId={selectedLandType}
              onSelect={handleUseCaseSelect}
              selectedUseCase={selectedUseCase}
            />
          )}

          {currentStep === 'field-selection' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Field Selection
              </h2>
              <p className="text-gray-600 mb-8">
                This step will be implemented in Phase 4
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Selected Land Type: <span className="font-semibold">
                    {getLandType(selectedLandType!)?.display_name}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Selected Use Case ID: <span className="font-semibold">
                    {selectedUseCase}
                  </span>
                </p>
              </div>
            </div>
          )}

          {currentStep === 'analysis' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analysis View
              </h2>
              <p className="text-gray-600">
                This step will be implemented in Phase 5-6
              </p>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(selectedLandType || selectedUseCase) && (
          <div className="text-center mt-6">
            <button
              onClick={resetWorkflow}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Step Indicator Component
interface StepIndicatorProps {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ number, label, isActive, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
        ${isCompleted 
          ? 'bg-green-500 text-white' 
          : isActive 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-300 text-gray-600'
        }
      `}>
        {isCompleted ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`text-xs mt-1 font-medium ${
        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
}
