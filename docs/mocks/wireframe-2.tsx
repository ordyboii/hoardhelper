import React, { useState } from 'react';
import {
    Upload,
    Database,
    History,
    Settings,
    FileVideo,
    X,
    RefreshCcw,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Trash2,
    Save,
    FolderOpen
} from 'lucide-react';

// --- MOCK DATA ---

const MOCK_HORDE_ITEMS = [
    { id: 1, original: 'Mr.Robot.S01E01.eps1.0_hellofriend.mov.1080p.x265.mkv', rename: 'Mr. Robot - S01E01 - eps1.0_hellofriend.mkv', type: 'TV Show', status: 'Ready', size: '1.2 GB' },
    { id: 2, original: 'The.Matrix.1999.REMASTERED.1080p.BluRay.x264.mp4', rename: 'The Matrix (1999).mp4', type: 'Movie', status: 'Processing', size: '2.4 GB' },
    { id: 3, original: 'Inception_2010_DvDRip_XviD.avi', rename: 'Inception (2010).avi', type: 'Movie', status: 'Pending', size: '700 MB' },
    { id: 4, original: 'breaking_bad_s05e14_ozymandias_720p.mkv', rename: 'Breaking Bad - S05E14 - Ozymandias.mkv', type: 'TV Show', status: 'Ready', size: '950 MB' },
];

const MOCK_HISTORY_ITEMS = [
    { id: 101, file: 'Interstellar (2014).mkv', status: 'Success', date: '2023-10-24 14:30', error: null },
    { id: 102, file: 'Dune Part Two (2024).mp4', status: 'Failed', date: '2023-10-24 14:32', error: 'WebDAV Timeout' },
    { id: 103, file: 'Severance - S01E09.mkv', status: 'Success', date: '2023-10-23 09:15', error: null },
];

// --- COMPONENTS ---

// 1. Sidebar Navigation
const Sidebar = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'upload', label: 'Ingest / Upload', icon: Upload },
        { id: 'horde', label: 'The Horde', icon: Database },
        { id: 'history', label: 'History & Tracking', icon: History },
    ];

    return (
        <div className="w-64 bg-gray-200 border-r-2 border-gray-400 flex flex-col h-full text-gray-800 flex-shrink-0">
            <div className="p-6 border-b-2 border-gray-400 bg-gray-300">
                <h1 className="font-bold text-xl uppercase tracking-wider text-gray-700">Hoard Helper</h1>
                <p className="text-xs text-gray-500 mt-1">Wireframe Prototype v0.1</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded border-2 transition-all ${activeView === item.id
                                ? 'bg-white border-gray-800 shadow-md font-bold'
                                : 'bg-transparent border-transparent hover:bg-gray-300 hover:border-gray-300'
                            }`}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t-2 border-gray-400">
                <button
                    onClick={() => setActiveView('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded border-2 ${activeView === 'settings'
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-gray-300 border-gray-400 text-gray-700 hover:bg-gray-400'
                        }`}
                >
                    <Settings size={20} className="flex-shrink-0" />
                    <span className="truncate">System Settings</span>
                </button>
            </div>
        </div>
    );
};

// 2. Upload View
const UploadView = () => {
    return (
        <div className="flex flex-col h-full p-8 w-full overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Ingest Media</h2>
                <p className="text-gray-600 mb-8 text-lg">Drag files here to begin the identification and cleaning process.</p>

                <div className="flex-1 border-4 border-dashed border-gray-400 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-12 transition-colors hover:bg-gray-100 hover:border-gray-600 cursor-pointer group min-h-[400px]">
                    <div className="bg-gray-200 p-8 rounded-full mb-6 group-hover:bg-gray-300 transition-colors">
                        <Upload size={64} className="text-gray-500 group-hover:text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2 text-center">Drop your treasures here</h3>
                    <p className="text-gray-500 mb-8 text-center">or click to browse your local filesystem</p>

                    <button className="px-8 py-3 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 shadow-lg whitespace-nowrap">
                        Select Files
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-500 text-sm">
                    <div className="p-4 bg-gray-100 rounded border border-gray-200">
                        <FileVideo className="mx-auto mb-2 opacity-50" />
                        Supports .mkv, .mp4, .avi
                    </div>
                    <div className="p-4 bg-gray-100 rounded border border-gray-200">
                        <Database className="mx-auto mb-2 opacity-50" />
                        Auto-metadata Extraction
                    </div>
                    <div className="p-4 bg-gray-100 rounded border border-gray-200">
                        <CheckCircle className="mx-auto mb-2 opacity-50" />
                        Checksum Verification
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Horde View (List/Table)
const HordeView = () => {
    return (
        <div className="flex flex-col h-full p-8 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">The Horde</h2>
                    <p className="text-gray-600 mt-1">Review pending changes before securing to Nextcloud.</p>
                </div>
                <div className="flex space-x-3 flex-shrink-0">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 font-medium whitespace-nowrap">
                        Clear All
                    </button>
                    <button className="px-6 py-2 bg-gray-800 text-white border border-gray-800 rounded shadow hover:bg-gray-700 font-bold whitespace-nowrap">
                        Process & Upload All
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 flex flex-col">
                    <div className="min-w-[900px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 border-b-2 border-gray-300 font-bold text-gray-700 text-sm uppercase tracking-wider items-center">
                            <div className="col-span-3">Original Filename</div>
                            <div className="col-span-3">Proposed Rename</div>
                            <div className="col-span-1 text-center">Type</div>
                            <div className="col-span-1 text-center">Size</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="overflow-y-auto">
                            {MOCK_HORDE_ITEMS.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 items-center text-sm">
                                    {/* Original Name */}
                                    <div className="col-span-3 flex items-center space-x-2 min-w-0" title={item.original}>
                                        <FileVideo size={16} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500 truncate font-mono block">{item.original}</span>
                                    </div>

                                    {/* New Name */}
                                    <div className="col-span-3 font-medium text-gray-900 min-w-0" title={item.rename}>
                                        <div className="truncate">{item.rename}</div>
                                    </div>

                                    {/* Type */}
                                    <div className="col-span-1 text-center">
                                        <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600 font-bold whitespace-nowrap">{item.type}</span>
                                    </div>

                                    {/* Size */}
                                    <div className="col-span-1 text-center text-gray-500 font-mono text-xs whitespace-nowrap">
                                        {item.size}
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex justify-center">
                                        {item.status === 'Ready' && <span className="flex items-center text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap"><CheckCircle size={12} className="mr-1 flex-shrink-0" /> Ready</span>}
                                        {item.status === 'Processing' && <span className="flex items-center text-xs font-bold text-gray-800 bg-gray-300 px-2 py-1 rounded-full animate-pulse whitespace-nowrap">Processing...</span>}
                                        {item.status === 'Pending' && <span className="flex items-center text-xs font-bold text-gray-500 border border-gray-300 px-2 py-1 rounded-full whitespace-nowrap">Pending</span>}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-center space-x-2">
                                        <button className="p-1 hover:bg-gray-200 rounded text-gray-500 flex-shrink-0" title="Edit Metadata">
                                            <MoreVertical size={16} />
                                        </button>
                                        <button className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 flex-shrink-0" title="Remove">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. History View
const HistoryView = () => {
    return (
        <div className="flex flex-col h-full p-8 w-full overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">History Log</h2>
                <p className="text-gray-600 mt-1">Track failures and review successfully secured assets.</p>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                {MOCK_HISTORY_ITEMS.map((item) => (
                    <div key={item.id} className={`p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.status === 'Failed' ? 'bg-gray-50' : ''}`}>
                        <div className="flex items-center space-x-4 min-w-0">
                            <div className={`p-2 rounded-full flex-shrink-0 ${item.status === 'Success' ? 'bg-gray-200 text-gray-600' : 'bg-gray-800 text-white'}`}>
                                {item.status === 'Success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-800 truncate">{item.file}</div>
                                <div className="text-xs text-gray-500 flex items-center space-x-2 flex-wrap">
                                    <span>{item.date}</span>
                                    {item.error && (
                                        <>
                                            <span>•</span>
                                            <span className="font-bold text-red-600 bg-red-50 px-1 rounded whitespace-nowrap">{item.error}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 ml-12 md:ml-0">
                            {item.status === 'Failed' ? (
                                <button className="flex items-center space-x-2 px-3 py-2 bg-white border-2 border-gray-800 text-gray-800 font-bold rounded hover:bg-gray-100 whitespace-nowrap">
                                    <RefreshCcw size={16} />
                                    <span>Retry Upload</span>
                                </button>
                            ) : (
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <FolderOpen size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Settings View
const SettingsView = () => {
    return (
        <div className="flex flex-col h-full p-8 w-full overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">System Settings</h2>

                <div className="space-y-8">

                    {/* Connection Section */}
                    <section className="bg-white p-6 border-2 border-gray-300 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Database className="mr-2 flex-shrink-0" size={20} />
                            WebDAV Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Server URL</label>
                                <input type="text" defaultValue="https://cloud.example.com/remote.php/dav/files/user/" className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:border-gray-800 focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Username</label>
                                    <input type="text" defaultValue="admin" className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:border-gray-800 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">App Password</label>
                                    <input type="password" defaultValue="••••••••••••" className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:border-gray-800 focus:outline-none" />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button className="text-sm font-bold text-gray-600 underline hover:text-gray-900 mr-4">Test Connection</button>
                            </div>
                        </div>
                    </section>

                    {/* Naming Conventions */}
                    <section className="bg-white p-6 border-2 border-gray-300 rounded-lg opacity-75">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FileVideo className="mr-2 flex-shrink-0" size={20} />
                            Naming Templates (Read Only in Prototype)
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-100 border border-gray-200 rounded text-sm font-mono text-gray-600 break-all">
                                Movies: {'{Title} ({Year})/{Title} ({Year}).{ext}'}
                            </div>
                            <div className="p-3 bg-gray-100 border border-gray-200 rounded text-sm font-mono text-gray-600 break-all">
                                TV Shows: {'{Show}/Season {Season}/{Show} - S{Season}E{Episode} - {Title}.{ext}'}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded">Discard Changes</button>
                        <button className="px-8 py-3 bg-gray-800 text-white font-bold rounded flex items-center shadow-lg hover:bg-gray-700">
                            <Save size={18} className="mr-2 flex-shrink-0" />
                            Save Configuration
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- MAIN APP LAYOUT ---

export default function App() {
    const [activeView, setActiveView] = useState('upload');

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                {activeView === 'upload' && <UploadView />}
                {activeView === 'horde' && <HordeView />}
                {activeView === 'history' && <HistoryView />}
                {activeView === 'settings' && <SettingsView />}
            </main>
        </div>
    );
}