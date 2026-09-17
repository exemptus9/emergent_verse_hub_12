import React, { useState } from 'react';
import { 
  Download, FileJson, FileSpreadsheet, FileText, Users, 
  Check, Loader2, ExternalLink
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';

const AdminExport = () => {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDownload = async (type, url, filename) => {
    setDownloading(type);
    setSuccess(null);
    
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(type);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {

    } finally {
      setDownloading(null);
    }
  };

  const exportOptions = [
    {
      id: 'poems-json',
      title: 'Poems (JSON)',
      description: 'Complete poem data including all metadata, ratings, and tags.',
      icon: FileJson,
      color: 'blue',
      url: adminApi.exportPoemsJSON(),
      filename: `poems_${new Date().toISOString().split('T')[0]}.json`,
      format: 'JSON'
    },
    {
      id: 'poems-csv',
      title: 'Poems (CSV)',
      description: 'Spreadsheet-friendly format for data analysis.',
      icon: FileSpreadsheet,
      color: 'green',
      url: adminApi.exportPoemsCSV(),
      filename: `poems_${new Date().toISOString().split('T')[0]}.csv`,
      format: 'CSV'
    },
    {
      id: 'poems-pdf',
      title: 'Poems (PDF)',
      description: 'Beautifully formatted PDF book of all poems.',
      icon: FileText,
      color: 'red',
      url: adminApi.exportPoemsPDF(),
      filename: `RhymeMosaic_Collection_${new Date().toISOString().split('T')[0]}.pdf`,
      format: 'PDF'
    },
    {
      id: 'subscribers-csv',
      title: 'Newsletter Subscribers',
      description: 'List of all active email subscribers.',
      icon: Users,
      color: 'purple',
      url: adminApi.exportSubscribersCSV(),
      filename: `subscribers_${new Date().toISOString().split('T')[0]}.csv`,
      format: 'CSV'
    }
  ];

  const colors = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
  };

  const buttonColors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Download className="w-6 h-6" />
          Export & Backup
        </h2>
        <p className="text-gray-500 mt-1">Download your data in various formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => (
          <div 
            key={option.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${colors[option.color]}`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{option.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                    {option.format}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                onClick={() => handleDownload(option.id, option.url, option.filename)}
                disabled={downloading === option.id}
                className={`w-full ${buttonColors[option.color]} text-white flex items-center justify-center gap-2`}
              >
                {downloading === option.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : success === option.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download {option.format}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-2">Export Tips</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span><strong>JSON</strong> is best for backups and data migration.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span><strong>CSV</strong> can be opened in Excel, Google Sheets, or any spreadsheet app.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span><strong>PDF</strong> creates a beautiful printable book of all your poems.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Regular backups are recommended. Export your data weekly or monthly.</span>
          </li>
        </ul>
      </div>

      {/* Sitemap Link */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-2">SEO Resources</h3>
        <div className="flex flex-wrap gap-4">
          <a 
            href="/api/sitemap.xml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#1e73be] hover:underline text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Sitemap (XML)
          </a>
          <a 
            href="/api/robots.txt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#1e73be] hover:underline text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View robots.txt
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminExport;
