import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Mail, Feather, Instagram, Facebook, ExternalLink, PenTool } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO 
        title="About Brandon WordSmith"
        description="The story behind RhymeMosaic — 200+ poems born from real pain, real faith, and the stubborn belief that writing can keep you alive."
        tags={['about', 'Brandon WordSmith', 'RhymeMosaic', 'poetry', 'poet']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Author Header */}
            <div className="bg-gradient-to-r from-[#1e73be] to-[#2d8cd9] p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <PenTool className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif mb-2">Brandon WordSmith</h1>
                  <p className="text-white/80 text-lg italic">Poet & Author</p>
                  <p className="text-white/60 text-sm mt-1">Creator of RhymeMosaic</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Tagline */}
              <div className="text-center mb-8">
                <blockquote className="text-xl font-serif text-gray-700 italic" data-testid="author-quote">
                  "I don't fight for my survival - I write for it."
                </blockquote>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  I started writing because I didn't know how else to stay alive. That's not a 
                  metaphor. There were nights where the only thing between me and the end was a 
                  pen and something to bleed onto. Over the years, those pages became over 200 poems 
                  — and eventually, this site.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  RhymeMosaic is what happens when you take a decade of heartbreak, mental health 
                  battles, fractured relationships, and a complicated faith — and refuse to let any 
                  of it go unspoken. These poems aren't polished for comfort. They're honest. Some are 
                  angry. Some are desperate. A lot of them were written at 3am when sleep wasn't an option 
                  and silence was too loud.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <Feather className="w-6 h-6 text-[#1e73be] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-base font-serif text-gray-800 mb-2">What You'll Find Here</h3>
                        <p className="text-gray-600 text-sm">
                          Poems about depression, loss, loneliness, and the kind of pain that 
                          doesn't have a clean ending. But also poems about getting back up, 
                          about faith when faith doesn't make sense, and about the stubborn, 
                          irrational decision to keep going anyway.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <Heart className="w-6 h-6 text-[#1e73be] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-base font-serif text-gray-800 mb-2">Why It Matters</h3>
                        <p className="text-gray-600 text-sm">
                          If you landed here because you're hurting, I get it. I wrote most of 
                          these because I was too. You're not alone in this — and sometimes 
                          just knowing someone else put your exact feeling into words is enough 
                          to make it through the night.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  The name "RhymeMosaic" comes from the idea that broken pieces — of a life, 
                  of a heart, of a mind — can still be arranged into something worth looking at. 
                  Every poem here is a fragment. Together, they're the full picture.
                </p>

                {/* The Book */}
                <div className="bg-[#1e73be]/5 border border-[#1e73be]/20 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <BookOpen className="w-8 h-8 text-[#1e73be] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-serif text-gray-800 mb-2">The Book: RhymeMosaic - Progressions</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        All 205 poems in one place. I put this together because some things deserve to 
                        exist outside a screen — something you can hold, mark up, pass along. 
                        Available in print on Amazon, or reach out if you want a signed copy.
                      </p>
                      <a 
                        href="https://a.co/d/aKlvWgS" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e73be] text-white text-sm rounded hover:bg-[#1a5fa0] transition-colors"
                        data-testid="amazon-book-link"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Get Your Copy on Amazon
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-serif text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#1e73be]" />
                    Connect with Brandon
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/contact"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      data-testid="about-contact-link"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </Link>
                    <a 
                      href="https://www.instagram.com/rhyme.osaic/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                    <a 
                      href="https://www.tiktok.com/@rhymemosaic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                    >
                      TikTok
                    </a>
                    <a 
                      href="https://www.facebook.com/RhymeMosaic/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white text-sm rounded hover:bg-[#166fe5] transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </a>
                    <a 
                      href="https://www.threads.com/@rhyme.osaic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Threads
                    </a>
                  </div>
                </div>

                {/* Browse Poems CTA */}
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">Start reading. Start somewhere.</p>
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5fa0] transition-colors"
                    data-testid="browse-poems-cta"
                  >
                    <BookOpen className="w-5 h-5" />
                    Browse All Poems
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">
                    "If you are here and reading this,<br />
                    I probably understand why you are desperate,<br />
                    searching for a single helping hand."
                  </p>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    — From "Helping Hand"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Sidebar />
      </div>
    </div>
  );
};

export default AboutPage;
