import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, FileText, ActivitySquare, Loader2, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

// Makes the UI look clean, but keeps the underlying JSON keys lowercase
const labelMap = {
  pregnancies: "Pregnancies",
  glucose: "Glucose (mg/dL)",
  blood_pressure: "Blood Pressure (mmHg)",
  skin_thickness: "Skin Thickness (mm)",
  insulin: "Insulin (μU/mL)",
  bmi: "BMI (kg/m²)",
  dpf: "Diabetes Pedigree",
  age: "Age (Years)"
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [metrics, setMetrics] = useState({
    pregnancies: 0, glucose: 100, blood_pressure: 70,
    skin_thickness: 20, insulin: 79, bmi: 25, dpf: 0.5, age: 30
  });

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for easy deletion, otherwise parse float
    setMetrics(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();

      setReport({
        riskLevel: `${data.prediction.risk_level} Risk`,
        confidenceScore: data.prediction.confidence,
        aiExplanation: data.clinical_narrative,
        shapValues: Object.entries(data.explanation_data.impact_scores).map(([key, val]) => ({
          feature: labelMap[key] || key, // Make SHAP labels pretty
          impact: val
        }))
      });
    } catch (err) {
      setError('Backend connection failed. Ensure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
            <ActivitySquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ECDSS</h1>
            <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Explainable Clinical Decision Support</p>
          </div>
        </div>

        <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="w-full px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-80px)]">

        {/* INPUT SECTION */}
        <section className="lg:col-span-4 space-y-6">
          <div className={`rounded-2xl shadow-sm border p-6 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className={`w-5 h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              Patient Metrics
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(metrics).map((key) => (
                  <div className="space-y-1.5" key={key}>
                    <label className={`text-xs font-bold uppercase tracking-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {labelMap[key]}
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={metrics[key]}
                      onChange={handleInputChange}
                      step="any"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Analyze Risk'}
              </button>
            </form>
          </div>
        </section>

        {/* DASHBOARD SECTION */}
        <section className="lg:col-span-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div><h3 className="font-medium">Analysis Error</h3><p className="text-sm mt-1">{error}</p></div>
            </div>
          )}

          {!report && !loading && !error && (
            <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <ActivitySquare className={`w-8 h-8 mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
              <h3 className="text-lg font-medium">Ready for Analysis</h3>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Enter metrics on the left and click Analyze Risk.</p>
            </div>
          )}

          {loading && (
            <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center h-full min-h-[400px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium">Processing Data...</h3>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`rounded-2xl p-6 border ${report.riskLevel.includes('High') ? (darkMode ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200') : (darkMode ? 'bg-emerald-950/30 border-emerald-900' : 'bg-emerald-50 border-emerald-200')}`}>
                  <h3 className={`text-sm font-semibold uppercase mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Risk Assessment</h3>
                  <div className={`text-4xl font-bold ${report.riskLevel.includes('High') ? 'text-red-500' : 'text-emerald-500'}`}>{report.riskLevel}</div>
                </div>

                <div className={`rounded-2xl p-6 border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className={`text-sm font-semibold uppercase mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Confidence Score</h3>
                  <span className="text-4xl font-bold">{(report.confidenceScore * 100).toFixed(1)}%</span>
                  <div className={`w-full h-2 rounded-full mt-4 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${report.confidenceScore * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-2xl p-6 border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-semibold mb-6">SHAP Feature Importance</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.shapValues} layout="vertical" margin={{ left: 40, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="feature" type="category" width={110} tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                        <Tooltip contentStyle={darkMode ? { backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' } : {}} />
                        <ReferenceLine x={0} stroke={darkMode ? "#334155" : "#cbd5e1"} />
                        <Bar dataKey="impact">
                          {report.shapValues.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border shadow-sm flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-500"><Activity size={20} /> Narrative</h3>
                  <p className={`leading-relaxed italic flex-grow ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{report.aiExplanation}"</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;