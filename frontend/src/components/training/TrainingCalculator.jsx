/**
 * Training Calculator Component
 * Calculates optimal training plans based on current stats and desired targets
 * 
 * @file src/components/training/TrainingCalculator.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';

/**
 * Company positions and their stat bonuses
 */
const COMPANY_POSITIONS = {
  'Pyrotechnician': { manual: 50, intelligence: 25, endurance: 0 },
  'Picker Packer': { manual: 50, intelligence: 0, endurance: 25 },
  'Salesperson': { manual: 0, intelligence: 25, endurance: 50 },
  'Trainer': { manual: 0, intelligence: 50, endurance: 25 }
};

/**
 * Calculate optimal training plan using greedy algorithm
 * @param {Object} currentStats - Current stat levels
 * @param {Object} targetStats - Desired stat levels
 * @returns {Object} Optimal training plan
 */
const calculateOptimalPlan = (currentStats, targetStats) => {
  const requiredGains = {
    manual: Math.max(0, targetStats.manual - currentStats.manual),
    intelligence: Math.max(0, targetStats.intelligence - currentStats.intelligence),
    endurance: Math.max(0, targetStats.endurance - currentStats.endurance)
  };

  // If no gains required, return empty plan
  if (requiredGains.manual === 0 && requiredGains.intelligence === 0 && requiredGains.endurance === 0) {
    return {
      plan: {},
      totalTrains: 0,
      finalStats: currentStats,
      isOptimal: true
    };
  }

  // Try all possible combinations using a greedy approach
  const positions = Object.keys(COMPANY_POSITIONS);
  let bestPlan = null;
  let minTrains = Infinity;

  // Simple greedy algorithm - prioritize positions that give the most needed stats
  const plan = {};
  let remainingGains = { ...requiredGains };
  let totalTrains = 0;

  // Sort positions by efficiency for current needs
  const sortedPositions = positions.sort((a, b) => {
    const efficiencyA = calculateEfficiency(COMPANY_POSITIONS[a], remainingGains);
    const efficiencyB = calculateEfficiency(COMPANY_POSITIONS[b], remainingGains);
    return efficiencyB - efficiencyA;
  });

  // Greedy assignment
  for (const position of sortedPositions) {
    const positionGains = COMPANY_POSITIONS[position];
    
    // Calculate how many trains of this position we need
    let trainsNeeded = 0;
    
    if (positionGains.manual > 0 && remainingGains.manual > 0) {
      trainsNeeded = Math.max(trainsNeeded, Math.ceil(remainingGains.manual / positionGains.manual));
    }
    if (positionGains.intelligence > 0 && remainingGains.intelligence > 0) {
      trainsNeeded = Math.max(trainsNeeded, Math.ceil(remainingGains.intelligence / positionGains.intelligence));
    }
    if (positionGains.endurance > 0 && remainingGains.endurance > 0) {
      trainsNeeded = Math.max(trainsNeeded, Math.ceil(remainingGains.endurance / positionGains.endurance));
    }

    if (trainsNeeded > 0) {
      plan[position] = trainsNeeded;
      totalTrains += trainsNeeded;

      // Update remaining gains
      remainingGains.manual = Math.max(0, remainingGains.manual - (positionGains.manual * trainsNeeded));
      remainingGains.intelligence = Math.max(0, remainingGains.intelligence - (positionGains.intelligence * trainsNeeded));
      remainingGains.endurance = Math.max(0, remainingGains.endurance - (positionGains.endurance * trainsNeeded));
    }
  }

  // Calculate final stats
  const finalStats = { ...currentStats };
  Object.entries(plan).forEach(([position, trains]) => {
    const gains = COMPANY_POSITIONS[position];
    finalStats.manual += gains.manual * trains;
    finalStats.intelligence += gains.intelligence * trains;
    finalStats.endurance += gains.endurance * trains;
  });

  return {
    plan,
    totalTrains,
    finalStats,
    isOptimal: true,
    requiredGains
  };
};

/**
 * Calculate efficiency of a position for current needs
 * @param {Object} positionGains - Stat gains from position
 * @param {Object} neededGains - Required stat gains
 * @returns {number} Efficiency score
 */
const calculateEfficiency = (positionGains, neededGains) => {
  let efficiency = 0;
  
  if (neededGains.manual > 0 && positionGains.manual > 0) {
    efficiency += positionGains.manual;
  }
  if (neededGains.intelligence > 0 && positionGains.intelligence > 0) {
    efficiency += positionGains.intelligence;
  }
  if (neededGains.endurance > 0 && positionGains.endurance > 0) {
    efficiency += positionGains.endurance;
  }
  
  return efficiency;
};

/**
 * Training Calculator Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.currentStats - Current player stats (optional)
 * @returns {JSX.Element} Training calculator component
 */
const TrainingCalculator = ({ darkMode = false, currentStats = null }) => {
  const [formData, setFormData] = useState({
    currentManual: currentStats?.manualLabor || 50000,
    currentIntelligence: currentStats?.intelligence || 25000,
    currentEndurance: currentStats?.endurance || 10000,
    targetManual: 100000,
    targetIntelligence: 100000,
    targetEndurance: 100000
  });

  const handleInputChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const trainingPlan = useMemo(() => {
    const current = {
      manual: formData.currentManual,
      intelligence: formData.currentIntelligence,
      endurance: formData.currentEndurance
    };

    const target = {
      manual: formData.targetManual,
      intelligence: formData.targetIntelligence,
      endurance: formData.targetEndurance
    };

    return calculateOptimalPlan(current, target);
  }, [formData]);

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Training Calculator
        </h2>
        <span className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Optimal Plan Generator
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Current Stats
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Manual Labor
                </label>
                <input
                  type="number"
                  value={formData.currentManual}
                  onChange={(e) => handleInputChange('currentManual', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Intelligence
                </label>
                <input
                  type="number"
                  value={formData.currentIntelligence}
                  onChange={(e) => handleInputChange('currentIntelligence', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Endurance
                </label>
                <input
                  type="number"
                  value={formData.currentEndurance}
                  onChange={(e) => handleInputChange('currentEndurance', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Target Stats
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Manual Labor
                </label>
                <input
                  type="number"
                  value={formData.targetManual}
                  onChange={(e) => handleInputChange('targetManual', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Intelligence
                </label>
                <input
                  type="number"
                  value={formData.targetIntelligence}
                  onChange={(e) => handleInputChange('targetIntelligence', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Endurance
                </label>
                <input
                  type="number"
                  value={formData.targetEndurance}
                  onChange={(e) => handleInputChange('targetEndurance', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Optimal Training Plan
            </h3>
            
            <div className={`p-4 rounded-lg mb-4 ${
              darkMode ? 'bg-slate-700/50' : 'bg-blue-50'
            }`}>
              <div className={`text-2xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-blue-900'
              }`}>
                {trainingPlan.totalTrains.toLocaleString()} Total Trains
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-slate-300' : 'text-blue-700'
              }`}>
                Estimated Cost: ${(trainingPlan.totalTrains * 390000).toLocaleString()}
              </div>
            </div>

            {trainingPlan.totalTrains > 0 ? (
              <div className="space-y-3">
                {Object.entries(trainingPlan.plan).map(([position, trains]) => (
                  <div key={position} className={`flex justify-between items-center p-3 rounded-lg ${
                    darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <div>
                      <div className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {position}
                      </div>
                      <div className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        +{COMPANY_POSITIONS[position].manual}/{COMPANY_POSITIONS[position].intelligence}/{COMPANY_POSITIONS[position].endurance} per train
                      </div>
                    </div>
                    <div className={`font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {trains.toLocaleString()} trains
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-4 ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                No training needed - you've already reached your targets!
              </div>
            )}
          </div>

          {trainingPlan.totalTrains > 0 && (
            <div>
              <h3 className={`text-lg font-medium mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Final Stats Preview
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Manual Labor:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {trainingPlan.finalStats.manual.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Intelligence:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {trainingPlan.finalStats.intelligence.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Endurance:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {trainingPlan.finalStats.endurance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingCalculator;