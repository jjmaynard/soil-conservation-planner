'use client'

import React from 'react'
import { AlertCircle, Info, CloudRain, AlertTriangle } from 'lucide-react'
import { useDroughtAssessment } from '@/hooks/useDroughtAssessment'
import type { EnhancedFieldData } from '@/hooks/useComprehensiveFieldAssessment'

interface DroughtRiskProps {
  fieldId: string
  wkt?: string
  geeData?: EnhancedFieldData | null
}

export default function DroughtRiskAnalysis({ fieldId, wkt, geeData }: DroughtRiskProps) {
  // Use the boundary string if provided
  const { data, loading, error } = useDroughtAssessment({
    wkt: wkt || '',
    autoFetch: !!wkt
  })

  // Fallback to legacy data if new API hasn't loaded but we have old data
  // But generally we prefer the new detailed data
  const hasLegacyData = geeData?.geeAssessment?.drought?.water_balance;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Analyzing drought conditions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>Failed to load drought assessment: {error.message}</p>
      </div>
    )
  }

  if (!data) {
     if (hasLegacyData) {
        // Render minimal legacy view if fallback exists
        return (
           <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
              <p>Detailed drought analysis unavailable. Using Cached Estimate.</p>
              {/* Simplified legacy render could go here, but for now just showing message */}
           </div>
        )
     }
    return (
      <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
        <p>No drought data available. Ensure a valid field boundary is selected.</p>
      </div>
    )
  }

  const { current_status, conditions_by_timeframe, technical_indices, conservation_impacts } = data

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Current Status Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CloudRain className="w-24 h-24" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">{current_status.severity}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                current_status.trend === 'Improving' ? 'bg-green-100 text-green-700' : 
                current_status.trend === 'Worsening' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
              }`}>
                Trend: {current_status.trend}
              </span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{current_status.summary}</p>
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Confidence Level: <strong>{current_status.confidence}</strong></span>
              <span className="mx-2">•</span>
              <span>Updated: {data.metadata.last_updated}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
             <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Index Agreement</h3>
             <div className="space-y-2">
               {Object.entries(current_status.index_agreement).map(([key, value]) => (
                 <div key={key} className="flex justify-between items-center text-sm">
                   <span className="text-gray-600">{key.replace('_', ' ')}</span>
                   <span className="font-medium text-gray-900">{value}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

     {/* Timeframes Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(conditions_by_timeframe).map(([key, condition]) => (
          <div key={key} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold capitalize text-gray-900">{key}</h3>
                <span className="text-xs text-gray-500 font-medium">{condition.period}</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                 condition.status === 'Normal' ? 'bg-green-100 text-green-700' : 
                 condition.status.includes('Dry') || condition.status.includes('Drought') ? 'bg-amber-100 text-amber-700' : 
                 'bg-blue-100 text-blue-700'
              }`}>
                {condition.status}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{condition.description}</p>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Relevant For:</p>
              <div className="flex flex-wrap gap-2">
                {condition.relevant_for.map((item: string, i: number) => (
                  <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
     </div>

     {/* Technical Indices */}
     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
       <div className="flex items-center gap-2 mb-6">
         <h3 className="text-lg font-bold text-gray-900">Technical Indices</h3>
         <div className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">Source: {data.metadata.data_source}</div>
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {Object.entries(technical_indices).map(([key, index]) => (
           <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-xl text-gray-900">{index.name}</span>
               {index.current_condition && (
                  <div className={`w-3 h-3 rounded-full ${
                    index.current_condition.includes('Drought') ? 'bg-red-500' : 'bg-green-500'
                  }`} title={index.current_condition} />
               )}
             </div>
             <p className="text-xs text-gray-500 mb-4 h-8 overflow-hidden" title={index.description}>{index.description}</p>
             
             <div className="space-y-2">
               {index.values.filter(v => ['30d', '90d', '1y', 'long-term'].includes(v.time_scale)).map((val, i) => (
                 <div key={i} className="flex justify-between items-center text-xs">
                   <span className="text-gray-600 font-medium">{val.time_scale}</span>
                   <div className="flex items-center gap-2">
                     <span className={`font-mono font-medium ${
                       val.value < -1 ? 'text-red-600' : val.value > 1 ? 'text-blue-600' : 'text-gray-900'
                     }`}>{val.value.toFixed(2)}</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         ))}
       </div>
     </div>

     {/* Conservation Impacts */}
     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
       <h3 className="text-lg font-bold mb-6 text-gray-900">Conservation Management Impacts</h3>
       
       <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Practice Recommendations</h4>
            <div className="space-y-3">
              {conservation_impacts.affected_practices.map((practice, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${
                   practice.impact === 'High' ? 'bg-red-50 border-red-500' : 
                   practice.impact === 'Medium' ? 'bg-yellow-50 border-yellow-500' : 
                   'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{practice.practice_name}</span>
                    <span className="text-xs font-medium opacity-75">{practice.impact} Impact</span>
                  </div>
                  <p className="text-sm text-gray-700">{practice.recommendation}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
               <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Soil Interaction</span>
               <p className="text-sm text-gray-700 italic">{conservation_impacts.soil_interaction_note}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Timing Considerations</h4>
             <div className="space-y-4">
               <div>
                 <span className="text-xs font-bold text-red-600 uppercase mb-2 block flex items-center gap-1">
                   <AlertTriangle className="w-3 h-3" /> Urgent (Next 14 Days)
                 </span>
                 <ul className="text-sm text-gray-700 space-y-1 pl-4 border-l-2 border-red-100">
                   {conservation_impacts.timing_considerations.urgent.length > 0 ? (
                     conservation_impacts.timing_considerations.urgent.map((item, i) => <li key={i}>{item}</li>)
                   ) : (
                     <li className="text-gray-400 italic">No urgent actions required</li>
                   )}
                 </ul>
               </div>

               <div>
                 <span className="text-xs font-bold text-yellow-600 uppercase mb-2 block">Near Term (Seasonal)</span>
                 <ul className="text-sm text-gray-700 space-y-1 pl-4 border-l-2 border-yellow-100">
                    {conservation_impacts.timing_considerations.near_term.length > 0 ? (
                       conservation_impacts.timing_considerations.near_term.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                       <li className="text-gray-400 italic">No specific near-term issues</li>
                    )}
                 </ul>
               </div>

               <div>
                 <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">Long-term Planning</span>
                 <ul className="text-sm text-gray-700 space-y-1 pl-4 border-l-2 border-blue-100">
                    {conservation_impacts.timing_considerations.planning.length > 0 ? (
                       conservation_impacts.timing_considerations.planning.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                       <li className="text-gray-400 italic">Continue standard planning</li>
                    )}
                 </ul>
               </div>
             </div>
          </div>
       </div>
     </div>
    </div>
  )
}
