import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, AlertCircle, Check, Loader2, RefreshCw, 
  TestTube, Clock, Users, ChevronDown
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

const AdminNewsletter = () => {
  const [emailStatus, setEmailStatus] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [status, subs, logsData] = await Promise.all([
        adminApi.getEmailStatus(),
        adminApi.getSubscribers(),
        adminApi.getNewsletterLogs()
      ]);
      setEmailStatus(status);
      setSubscribers(subs.subscribers);
      setLogs(logsData.logs);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (testMode = false) => {
    if (!subject.trim() || !content.trim()) {
      setSendResult({ success: false, message: 'Please fill in subject and content' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const result = await adminApi.sendNewsletter(subject, content, testMode);
      setSendResult({ success: true, ...result });
      if (!testMode) {
        setSubject('');
        setContent('');
        fetchData(); // Refresh logs
      }
    } catch (err) {
      setSendResult({ 
        success: false, 
        message: err.response?.data?.detail || 'Failed to send newsletter'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="bg-white rounded-lg p-6 h-96"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Newsletter
        </h2>
        <p className="text-gray-500 mt-1">Compose and send emails to your subscribers</p>
      </div>

      {/* Email Status Banner */}
      {!emailStatus?.configured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Email Service Not Configured</h3>
              <p className="text-sm text-amber-700 mt-1">
                To send newsletters, add your Resend API key to <code className="bg-amber-100 px-1 rounded">backend/.env</code>:
              </p>
              <pre className="mt-2 bg-amber-100 p-2 rounded text-xs text-amber-800 overflow-x-auto">
RESEND_API_KEY=re_your_api_key_here
ADMIN_EMAIL=your@email.com
              </pre>
              <p className="text-sm text-amber-700 mt-2">
                Get your free API key at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {emailStatus?.configured && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span>Email service configured</span>
            {emailStatus.adminEmail && (
              <span className="text-sm text-green-600">• Admin: {emailStatus.adminEmail}</span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-800">{subscribers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Newsletters Sent</p>
              <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Sent</p>
              <p className="text-lg font-medium text-gray-800">
                {logs[0] ? new Date(logs[0].sentAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Compose Newsletter</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here... HTML tags like <h2>, <p>, <a> are supported."
              rows={10}
              className="w-full resize-none"
            />
          </div>

          {sendResult && (
            <div className={`p-4 rounded-lg ${sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {sendResult.success ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={sendResult.success ? 'text-green-700' : 'text-red-700'}>
                  {sendResult.message}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => handleSend(false)}
              disabled={sending || !emailStatus?.configured || subscribers.length === 0}
              className="bg-[#1e73be] hover:bg-[#1a5fa0] text-white flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to {subscribers.length} Subscribers
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSend(true)}
              disabled={sending || !emailStatus?.configured || !emailStatus?.adminEmail}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Send Test Email
            </Button>
          </div>
        </div>
      </div>

      {/* Send History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h3 className="font-semibold text-gray-800">Send History</h3>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
        </button>
        
        {showLogs && (
          <div className="border-t border-gray-200 divide-y divide-gray-100">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{log.subject}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Sent to {log.sentCount} of {log.totalSubscribers} subscribers
                        {log.failedCount > 0 && (
                          <span className="text-red-500"> • {log.failedCount} failed</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No newsletters sent yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
