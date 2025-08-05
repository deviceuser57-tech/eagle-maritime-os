interface FrontPageProps {
  onEnterDashboard: () => void;
}

const FrontPage = ({ onEnterDashboard }: FrontPageProps) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      {/* Eagle Logo Placeholder */}
      <div className="w-48 h-48 mb-8 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
        <div className="text-6xl">🦅</div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
        EAGLE CAR'S
      </h1>
      <h2 className="text-3xl font-semibold text-blue-200 mb-2">
        Vessel Compliance Management
      </h2>
      <p className="text-xl text-blue-300 mb-12 max-w-2xl">
        Operation Compliance & Safety Excellence Platform
      </p>
      
      <button 
        onClick={onEnterDashboard}
        className="btn-maritime px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Enter Dashboard
      </button>
      
      {/* Feature Highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-blue-200">Real-time Monitoring</h3>
          <p className="text-sm text-blue-300">Live fleet status and compliance tracking</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-blue-200">AI-Powered Insights</h3>
          <p className="text-sm text-blue-300">Intelligent predictions and recommendations</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">⚓</div>
          <h3 className="font-semibold text-blue-200">Complete Management</h3>
          <p className="text-sm text-blue-300">End-to-end vessel lifecycle control</p>
        </div>
      </div>
    </div>
  );
};

export default FrontPage;