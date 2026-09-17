import React, { useState } from 'react';
import { Mail, Instagram, Facebook, Send, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// TikTok icon component (not in lucide)
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.082-1.168 3.576-1.302.898-.081 1.86-.034 2.857.137.09-.473.134-.96.134-1.457 0-.593-.063-1.17-.188-1.728l-.023-.09H8.267v2.134h3.776c.058.328.088.66.088.993 0 .552-.06 1.09-.174 1.607-1.38-.251-2.572-.288-3.558-.113-1.048.185-1.9.577-2.532 1.164-.753.7-1.13 1.6-1.06 2.532.074 1.002.537 1.843 1.302 2.367.684.468 1.564.692 2.521.645 1.21-.059 2.181-.501 2.887-1.314.542-.624.92-1.457 1.125-2.479.442.173.838.398 1.181.675.724.583 1.168 1.38 1.32 2.366.204 1.322-.092 2.9-1.524 4.3-1.766 1.725-4.097 2.378-7.14 2.398z"/>
  </svg>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [submitting, setSubmitting] = useState(false);

  const socialLinks = [
    {
      name: 'Send a Message',
      icon: Mail,
      value: 'Use the form below',
      href: '#contact-form',
      color: 'bg-red-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      value: '@rhyme.osaic',
      href: 'https://www.instagram.com/rhyme.osaic/',
      color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400'
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      value: '@b.wordsmith',
      href: 'https://tiktok.com/@b.wordsmith',
      color: 'bg-black'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      value: 'RhymeMosaic',
      href: 'https://www.facebook.com/profile.php?id=61564643920192',
      color: 'bg-[#1877F2]'
    },
    {
      name: 'Threads',
      icon: ThreadsIcon,
      value: '@rhyme.osaic',
      href: 'https://www.threads.com/@rhyme.osaic',
      color: 'bg-black'
    }
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await axios.post(`${API}/contact`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO 
        title="Contact"
        description="Get in touch with Brandon WordSmith. Connect on social media or send a message."
        tags={['contact', 'Brandon WordSmith', 'RhymeMosaic']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-3xl font-serif text-[#1e73be] mb-2">Get in Touch</h1>
            <p className="text-gray-600 mb-8">
              Have a question, feedback, or just want to connect? I'd love to hear from you!
            </p>

            {/* Social Links */}
            <div className="mb-10">
              <h2 className="text-xl font-serif text-gray-800 mb-4">Connect With Me</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#1e73be] hover:shadow-md transition-all group"
                    data-testid={`social-${social.name.toLowerCase()}`}
                  >
                    <div className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center text-white`}>
                      <social.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 group-hover:text-[#1e73be] transition-colors">
                        {social.name}
                      </p>
                      <p className="text-sm text-gray-500">{social.value}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1e73be]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-serif text-gray-800 mb-4">Send a Message</h2>
              
              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                  <Check className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Message sent successfully!</p>
                    <p className="text-sm">Thanks for reaching out. I'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p>Something went wrong. Please try again later or reach out via social media.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                    data-testid="contact-subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="What would you like to say?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be] resize-none"
                    data-testid="contact-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e73be] text-white font-medium rounded-lg hover:bg-[#1a5fa0] transition-colors disabled:opacity-50"
                  data-testid="contact-submit"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        <Sidebar />
      </div>
    </div>
  );
};

export default ContactPage;
