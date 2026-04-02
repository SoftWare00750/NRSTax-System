'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, DollarSign, TrendingUp, Bell, LogOut,
  Search, Plus, Eye, EyeOff, Download, CreditCard, Building2,
  Smartphone, Check, X, Edit, BarChart3, Filter, ChevronDown,
  ChevronRight, ChevronLeft, Menu, Phone, Mail, MapPin,
  ArrowRight, Calculator, AlertCircle, Clock, CheckCircle,
  Calendar, Activity, Award, Users, BookOpen, HelpCircle,
  ExternalLink, RefreshCw, Printer, Info, Lock, XCircle,
  Upload, PieChart, Layers, Zap, Star, Globe
} from 'lucide-react';
import Image from 'next/image';
import logo from '../public/images/logo.jpg';
import taxpayer from '../public/images/taxpayer.webp';
import taxconsultant from '../public/images/taxconsultant.webp';

// ============================================================================
// TYPES & ENUMS
// ============================================================================
enum SecurityLevel { Public = 0, Internal = 1, Confidential = 2, Restricted = 3, TopSecret = 4 }
enum SecurityLabel { Financial = 'Financial', Personal = 'Personal', Audit = 'Audit', Operations = 'Operations', Management = 'Management' }
enum UserRole { Taxpayer = 'Taxpayer', Staff = 'Staff', Admin = 'Admin' }
enum TaxType {
  PersonalIncome = 'Personal Income Tax',
  Corporate = 'Corporate Tax',
  VAT = 'Value Added Tax',
  WithholdingTax = 'Withholding Tax'
}

interface User {
  id: string; name: string; email: string; role: UserRole;
  securityLevel: SecurityLevel; securityLabels: SecurityLabel[];
  tin?: string; department?: string; phone?: string;
}
interface TaxReturn {
  id: string; taxpayerId: string; taxpayerName: string; taxYear: number;
  taxType: TaxType; grossIncome: number; taxAmount: number; status: string;
  filingDate: Date; securityLevel: SecurityLevel; securityLabels: SecurityLabel[];
  dueDate?: Date;
}
type PageType = 'home' | 'login' | 'dashboard' | 'file-return' | 'payment' | 'history' | 'profile' | 'admin-returns' | 'admin-users' | 'admin-reports' | 'staff-queue';

// ============================================================================
// BELL-LAPADULA
// ============================================================================
class BellLaPadula {
  static canRead(user: User, resource: any): boolean {
    return user.securityLevel >= resource.securityLevel &&
      (resource.securityLabels?.every((l: SecurityLabel) => user.securityLabels.includes(l)) ?? true);
  }
  static filterReadable<T extends { securityLevel: SecurityLevel; securityLabels?: SecurityLabel[] }>(user: User, items: T[]): T[] {
    return items.filter(item => this.canRead(user, item));
  }
  static getLevelColor(level: SecurityLevel): string {
    return ['#6b7280', '#3b82f6', '#d97706', '#ea580c', '#dc2626'][level];
  }
  static getLevelBg(level: SecurityLevel): string {
    return ['bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700'][level];
  }
  static getLevelName(level: SecurityLevel): string {
    return ['Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'][level];
  }
}

// ============================================================================
// UTILS
// ============================================================================
const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
const calcTax = (income: number): number => {
  if (income <= 300000) return income * 0.07;
  if (income <= 600000) return 21000 + (income - 300000) * 0.11;
  if (income <= 1100000) return 54000 + (income - 600000) * 0.15;
  if (income <= 1600000) return 129000 + (income - 1100000) * 0.19;
  if (income <= 3200000) return 224000 + (income - 1600000) * 0.21;
  return 560000 + (income - 3200000) * 0.24;
};

// ============================================================================
// DEMO DATA
// ============================================================================
const demoUsers: User[] = [
  { id: '1', name: 'Adaeze Okonkwo', email: 'admin@nrs.gov.ng', role: UserRole.Admin, securityLevel: SecurityLevel.TopSecret, securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal, SecurityLabel.Audit, SecurityLabel.Operations, SecurityLabel.Management], department: 'IT Administration', phone: '+234 800 000 0001' },
  { id: '2', name: 'Emeka Chukwu', email: 'officer@nrs.gov.ng', role: UserRole.Staff, department: 'Tax Administration', securityLevel: SecurityLevel.Confidential, securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal, SecurityLabel.Operations], phone: '+234 800 000 0002' },
  { id: '3', name: 'John Babatunde', email: 'john@example.com', role: UserRole.Taxpayer, tin: 'NRS-2024-00001', securityLevel: SecurityLevel.Internal, securityLabels: [SecurityLabel.Personal], phone: '+234 800 000 0003' }
];

const demoReturns = (): TaxReturn[] => [
  { id: '1', taxpayerId: '3', taxpayerName: 'John Babatunde', taxYear: 2024, taxType: TaxType.PersonalIncome, grossIncome: 5000000, taxAmount: calcTax(5000000), status: 'Submitted', filingDate: new Date('2024-03-15'), securityLevel: SecurityLevel.Internal, securityLabels: [SecurityLabel.Personal], dueDate: new Date('2024-06-30') },
  { id: '2', taxpayerId: '4', taxpayerName: 'ABC Corporation Ltd', taxYear: 2024, taxType: TaxType.Corporate, grossIncome: 50000000, taxAmount: 15000000, status: 'Under Review', filingDate: new Date('2024-04-01'), securityLevel: SecurityLevel.Confidential, securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal], dueDate: new Date('2024-07-31') },
  { id: '3', taxpayerId: '5', taxpayerName: 'XYZ Enterprises', taxYear: 2024, taxType: TaxType.VAT, grossIncome: 100000000, taxAmount: 7500000, status: 'Approved', filingDate: new Date('2024-05-10'), securityLevel: SecurityLevel.Restricted, securityLabels: [SecurityLabel.Financial, SecurityLabel.Audit], dueDate: new Date('2024-08-31') },
  { id: '4', taxpayerId: '6', taxpayerName: 'Dangote Ventures', taxYear: 2024, taxType: TaxType.WithholdingTax, grossIncome: 200000000, taxAmount: 30000000, status: 'Pending', filingDate: new Date('2024-06-01'), securityLevel: SecurityLevel.Confidential, securityLabels: [SecurityLabel.Financial], dueDate: new Date('2024-09-30') },
];

const newsData = [
  { id: 1, title: 'Implementation Timeline on the Phased Rollout of E-Invoicing & Electronic Receipt System', date: 'Mar 13, 2026', category: 'Press Release', excerpt: 'The NRS hereby informs taxpayers, practitioners, and the general public of the phased rollout timeline of the e-invoicing system for tax compliance.', isNew: false },
  { id: 2, title: 'VAT on Banking Fees Was Not Introduced by the Nigeria Tax Act', date: 'Mar 17, 2026', category: 'Press Release', excerpt: 'The Nigeria Revenue Service clarifies that VAT on banking fees was not introduced by the Nigeria Tax Act as previously reported by some media outlets.', isNew: true },
  { id: 3, title: 'NUPRC, NRS Deepen Partnership to Boost Revenue Collection', date: 'Mar 17, 2026', category: 'News', excerpt: 'The Nigerian Upstream Petroleum Regulatory Commission and the Nigeria Revenue Service have taken steps toward enhancing revenue collection for the nation.', isNew: true },
];

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const NRSLogo = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center gap-2">
      <Image
         src={logo}
      alt="Picture of the author"
      width={150}
      height={100}
      // placeholder="blur" // Optional: adds a blurred loading effect
      />
    
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-800 border-green-200',
    'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

// ============================================================================
// TOP ANNOUNCEMENT BAR
// ============================================================================
const AnnouncementBar = () => (
  <div className="bg-gray-900 text-white text-xs py-1.5 px-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
        <span className="font-medium">An official website of the Federal Republic of Nigeria</span>
      </span>
      <a href="#" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
        <Info className="w-3 h-3" /> Here's how you know
      </a>
    </div>
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 0800-NRS-TAX</span>
      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> help@nrs.gov.ng</span>
      <button className="bg-green-700 hover:bg-green-600 px-2 py-0.5 rounded text-xs transition-colors">e-Services</button>
      <span className="flex items-center gap-1 text-gray-400">🇳🇬 EN</span>
    </div>
  </div>
);

// ============================================================================
// MAIN NAVBAR
// ============================================================================
const Navbar = ({ onNavigate, currentUser, onLogin, onLogout }: {
  onNavigate: (p: PageType) => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
}) => {
  const [searchQ, setSearchQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <NRSLogo />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: 'HOME', page: 'home' as PageType },
              { label: 'SERVICES & INFO', page: 'home' as PageType },
              { label: 'RESOURCES', page: 'home' as PageType },
              { label: 'HELP & UPDATES', page: 'home' as PageType },
              { label: 'ABOUT', page: 'home' as PageType },
            ].map(nav => (
              <button key={nav.label} onClick={() => onNavigate(nav.page)}
                className="text-xs font-semibold text-gray-700 hover:text-green-800 tracking-wide transition-colors">
                {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-800 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name[0]}
                  </div>
                  <span className="hidden sm:block">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button onClick={onLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={onLogin}
                className="bg-green-800 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors">
                Sign In
              </button>
            )}
            <button className="md:hidden text-gray-500" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// HOME PAGE
// ============================================================================
const HomePage = ({ onNavigate, currentUser }: { onNavigate: (p: PageType) => void; currentUser: User | null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(0);
  const tags = ['Individual Income Tax', 'Company Income Tax', 'Withholding Tax', 'Value Added Tax', 'Stamp Duties', 'Capital Gains Tax'];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-50 py-14 px-4 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
          Together We Rise,
        </h1>
        <h1 className="text-4xl md:text-5xl font-black text-green-700 mb-4 leading-tight">
          Together We Prosper.
        </h1>
        <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
          Explore trusted info and resources for your tax needs – all in one convenient place.
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-5">
          <div className="flex rounded-md overflow-hidden border border-gray-300 shadow-sm bg-white">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search taxes, forms, resources..."
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 outline-none"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors">
              SEARCH
            </button>
          </div>
        </div>

        {/* Tag pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button className="w-6 h-6 rounded-full bg-green-800 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
            <ChevronLeft className="w-3 h-3" />
          </button>
          {tags.map((tag, i) => (
            <button key={i} onClick={() => setActiveTag(i)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${activeTag === i ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-600 border-gray-300 hover:border-green-600 hover:text-green-700'}`}>
              {tag}
            </button>
          ))}
          <button className="w-6 h-6 rounded-full bg-green-800 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-xl overflow-hidden h-44 cursor-pointer group"
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
            >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
            
              <div>
                <Image 
          src={taxpayer}
      alt="taxpayer"
      width={500}
      height={20}
      // placeholder="blur" // Optional: adds a blurred loading effect
          />
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden h-44 cursor-pointer group"
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
            style={{ background: 'linear-gradient(135deg, #014421 0%, #166534 100%)' }}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
            
            <Image
            src={taxconsultant}
            alt="Picture of the author"
            width={500}
            height={20}
          // placeholder="blur" // Optional: adds a blurred loading effect
             />   
         
          </div>
        </div>
      </section>

      {/* Get the Right Help */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Get the Right Help</h2>
          <p className="text-gray-500 text-sm mb-6">Quickly access what you need based on your role and requirements.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, label: 'Taxpayer', desc: 'Easily file your returns and manage your filings online.' },
              { icon: Award, label: 'Tax Consultant', desc: 'Access resources for tax professionals and consultants.' },
              { icon: Shield, label: 'Tax ID Verification', desc: 'Retrieve your Tax ID with ease.' },
              { icon: FileText, label: 'E-Invoicing', desc: 'Generate, verify and manage your invoices for tax compliance.' },
              { icon: Calendar, label: 'Tax Calendar', desc: 'Stay on top of tax filing deadlines and due dates.', badge: 'UPDATED' },
              { icon: BookOpen, label: 'Guidelines & Regulations', desc: 'Access our complete evergreen guidelines and resources.' },
              { icon: RefreshCw, label: 'Tax Reforms: What has changed', desc: 'Learn about the latest tax reforms and their impact.', badge: 'NEW' },
              { icon: MapPin, label: 'Tax Office Locator', desc: 'Find the nearest tax office and revenue office close to you.' },
            ].map((item, i) => (
              <button key={i} onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-left group relative">
                {item.badge && (
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge === 'NEW' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {item.badge}
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-3 group-hover:bg-green-50 transition-colors">
                  <item.icon className="w-4 h-4 text-red-400 group-hover:text-green-600 transition-colors" />
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1 leading-tight">{item.label}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Latest News & Updates</h2>
              <p className="text-gray-500 text-sm">Stay informed on the latest tax updates and policy announcements.</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-white bg-green-800 hover:bg-green-700 px-3 py-1.5 rounded transition-colors">
              View all news <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {newsData.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                <div className={`h-36 flex items-center justify-center relative ${article.id === 1 ? 'bg-gray-100' : article.id === 2 ? 'bg-green-800' : 'bg-gray-200'}`}>
                  {article.isNew && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">New</span>
                  )}
                  {article.id === 1 ? (
                    <div className="p-3 w-full h-full overflow-hidden">
                      <div className="grid grid-cols-5 gap-0.5 h-full opacity-60">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="bg-gray-300 rounded-sm text-[8px] p-1"></div>
                        ))}
                      </div>
                    </div>
                  ) : article.id === 2 ? (
                    <div className="text-center p-4">
                      <p className="text-white text-xs font-bold uppercase mb-1">PRESS RELEASE</p>
                      <p className="text-green-200 text-[10px] leading-tight">{article.title}</p>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-400">{article.date}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{article.category}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-2 line-clamp-2 leading-relaxed group-hover:text-green-800 transition-colors">{article.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                  <button className="mt-2 text-[10px] text-green-700 hover:text-green-800 font-semibold flex items-center gap-1">
                    Read More <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white pt-12 pb-0">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-lg font-bold">Connect with us</p>
            <div className="flex items-center gap-3">
              {['FB', 'X', 'IG', 'in', '▶'].map((s, i) => (
                <button key={i} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs transition-colors">{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 text-sm">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-green-300">Contact Information</h4>
              <div className="space-y-1.5 text-xs text-green-100">
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> help@nrs.gov.ng</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> 0800-NRS-TAX</p>
                <p className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5" /> No.26 Ahmadu Bello Way, Central Business District, Abuja</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-green-300">Services</h4>
              {['E-Invoicing Portal', 'Self Service Portal', 'Tax Consultant Portal'].map(s => (
                <p key={s} className="text-xs text-green-100 mb-1.5 hover:text-white cursor-pointer transition-colors">{s}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-green-300">Resources</h4>
              {['Press Releases', 'FAQs', 'Tax Offices'].map(r => (
                <p key={r} className="text-xs text-green-100 mb-1.5 hover:text-white cursor-pointer transition-colors">{r}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-green-300">More Links</h4>
              {['Privacy Policy', 'Awards & Accolades', 'Public Awareness'].map(l => (
                <p key={l} className="text-xs text-green-100 mb-1.5 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-green-300">Related Links</h4>
              {['FMF', 'CAC', 'NNPC'].map(l => (
                <p key={l} className="text-xs text-green-100 mb-1.5 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
          </div>

          <div className="border-t border-green-700 py-4 text-center">
            <p className="text-xs text-green-300">© 2026 Nigeria Revenue Service. All rights reserved. | Secured with Bell-LaPadula MAC Security</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// LOGIN PAGE
// ============================================================================
const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) { setError(''); onLogin(user); }
    else setError('Invalid email or password. Try one of the demo accounts.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <NRSLogo />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mt-1">Access Nigeria Revenue Service portal</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800 font-semibold mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Demo Credentials</p>
            <p className="text-xs text-blue-600">Admin: <span className="font-mono">admin@nrs.gov.ng</span></p>
            <p className="text-xs text-blue-600">Staff: <span className="font-mono">officer@nrs.gov.ng</span></p>
            <p className="text-xs text-blue-600">Taxpayer: <span className="font-mono">john@example.com</span></p>
            <p className="text-xs text-blue-500 mt-1">Any password works for demo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address / TIN</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="Enter your email" required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                placeholder="Enter your password" required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <button type="button" className="text-xs text-green-700 hover:text-green-800 font-medium">Forgot password?</button>
            </div>
            <button type="submit"
              className="w-full bg-green-800 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Or sign in as:</p>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map(u => (
                <button key={u.id} onClick={() => onLogin(u)}
                  className="text-xs py-2 px-2 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 text-gray-700 transition-all text-center leading-tight">
                  <div className="font-semibold">{u.role}</div>
                  <div className="text-gray-400 text-[9px] mt-0.5 truncate">{u.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-green-600" /> Protected by Bell-LaPadula Multi-Level Security
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD SIDEBAR
// ============================================================================
const DashboardSidebar = ({ user, activePage, onNavigate, onLogout }: {
  user: User; activePage: PageType; onNavigate: (p: PageType) => void; onLogout: () => void;
}) => {
  const adminNav = [
    { icon: Activity, label: 'Dashboard', page: 'dashboard' as PageType },
    { icon: FileText, label: 'Tax Returns', page: 'admin-returns' as PageType },
    { icon: Users, label: 'Users', page: 'admin-users' as PageType },
    { icon: BarChart3, label: 'Reports', page: 'admin-reports' as PageType },
    { icon: Shield, label: 'Security', page: 'dashboard' as PageType },
  ];
  const staffNav = [
    { icon: Activity, label: 'Dashboard', page: 'dashboard' as PageType },
    { icon: FileText, label: 'Review Queue', page: 'staff-queue' as PageType },
    { icon: Users, label: 'Taxpayers', page: 'dashboard' as PageType },
  ];
  const taxpayerNav = [
    { icon: Activity, label: 'Dashboard', page: 'dashboard' as PageType },
    { icon: Plus, label: 'File Tax Return', page: 'file-return' as PageType },
    { icon: CreditCard, label: 'Make Payment', page: 'payment' as PageType },
    { icon: FileText, label: 'Tax History', page: 'history' as PageType },
    { icon: Calculator, label: 'Tax Calculator', page: 'dashboard' as PageType },
  ];

  const navItems = user.role === UserRole.Admin ? adminNav : user.role === UserRole.Staff ? staffNav : taxpayerNav;

  return (
    <aside className="w-56 bg-green-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {user.name[0]}
          </div>
          <div>
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-green-300 text-[10px]">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2 px-2">Navigation</p>
        {navItems.map(item => (
          <button key={item.page + item.label} onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-xs font-medium transition-all ${activePage === item.page ? 'bg-white/20 text-white' : 'text-green-200 hover:bg-white/10 hover:text-white'}`}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-green-800">
          <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2 px-2">Account</p>
          <button onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-xs font-medium transition-all ${activePage === 'profile' ? 'bg-white/20 text-white' : 'text-green-200 hover:bg-white/10 hover:text-white'}`}>
            <Users className="w-4 h-4" /> Profile
          </button>
          <button onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-xs font-medium text-green-200 hover:bg-white/10 hover:text-white transition-all">
            <Globe className="w-4 h-4" /> Public Portal
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-green-800">
        <div className={`px-2 py-1.5 rounded mb-3 text-[9px] font-semibold ${BellLaPadula.getLevelBg(user.securityLevel)} flex items-center gap-1`}>
          <Shield className="w-3 h-3 flex-shrink-0" />
          Level {user.securityLevel}: {BellLaPadula.getLevelName(user.securityLevel)}
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

// ============================================================================
// DASHBOARD HEADER
// ============================================================================
const DashboardHeader = ({ user, title, onNavigate }: { user: User; title: string; onNavigate: (p: PageType) => void }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <div>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <p className="text-xs text-gray-500">Nigeria Revenue Service — Secure Portal</p>
    </div>
    <div className="flex items-center gap-4">
      <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-xs">
          {user.name[0]}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">{user.name}</p>
          <p className="text-[10px] text-gray-400">{user.email}</p>
        </div>
      </div>
    </div>
  </header>
);

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
const AdminDashboard = ({ user, onNavigate }: { user: User; onNavigate: (p: PageType) => void }) => {
  const allReturns = demoReturns();
  const accessible = BellLaPadula.filterReadable(user, allReturns);
  const totalRevenue = accessible.reduce((s, r) => s + r.taxAmount, 0);
  const approved = accessible.filter(r => r.status === 'Approved').length;
  const pending = accessible.filter(r => r.status !== 'Approved').length;

  const stats = [
    { label: 'Total Revenue Collected', value: fmt(totalRevenue), icon: DollarSign, color: 'bg-green-800', change: '+12.5%' },
    { label: 'Total Returns Filed', value: accessible.length.toString(), icon: FileText, color: 'bg-blue-700', change: '+8.3%' },
    { label: 'Approved Returns', value: approved.toString(), icon: CheckCircle, color: 'bg-emerald-600', change: '+5.1%' },
    { label: 'Pending Review', value: pending.toString(), icon: Clock, color: 'bg-orange-600', change: '-2.4%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-xs mt-1 font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
              {stat.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => onNavigate('admin-returns')}
          className="bg-green-800 hover:bg-green-700 text-white p-4 rounded-xl text-left transition-colors group">
          <FileText className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-sm">Manage Returns</p>
          <p className="text-green-200 text-xs mt-0.5">Review and process tax returns</p>
        </button>
        <button onClick={() => onNavigate('admin-users')}
          className="bg-blue-800 hover:bg-blue-700 text-white p-4 rounded-xl text-left transition-colors group">
          <Users className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-sm">User Management</p>
          <p className="text-blue-200 text-xs mt-0.5">Manage taxpayers and staff</p>
        </button>
        <button onClick={() => onNavigate('admin-reports')}
          className="bg-purple-800 hover:bg-purple-700 text-white p-4 rounded-xl text-left transition-colors group">
          <BarChart3 className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-sm">View Reports</p>
          <p className="text-purple-200 text-xs mt-0.5">Revenue analytics and insights</p>
        </button>
      </div>

      {/* Recent returns */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Recent Tax Returns</h3>
          <button onClick={() => onNavigate('admin-returns')} className="text-xs text-green-700 font-medium hover:text-green-800 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Taxpayer', 'Type', 'Gross Income', 'Tax Amount', 'Status', 'Security', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allReturns.map(tr => {
                const canRead = BellLaPadula.canRead(user, tr);
                return (
                  <tr key={tr.id} className={`hover:bg-gray-50 transition-colors ${!canRead ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{canRead ? tr.taxpayerName : '████████████'}</p>
                      <p className="text-gray-400 text-[10px]">{tr.taxYear}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{canRead ? tr.taxType.split(' ')[0] + '...' : '████'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{canRead ? fmt(tr.grossIncome) : '████████'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-700">{canRead ? fmt(tr.taxAmount) : '████████'}</td>
                    <td className="px-4 py-3">{canRead ? <StatusBadge status={tr.status} /> : <span className="text-gray-300">████</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${BellLaPadula.getLevelBg(tr.securityLevel)}`}>
                        L{tr.securityLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canRead ? (
                        <div className="flex gap-1">
                          <button className="text-blue-500 hover:text-blue-700 p-0.5 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="text-green-500 hover:text-green-700 p-0.5 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bell-LaPadula Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Bell-LaPadula Access Control Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Readable Records', value: accessible.length, color: 'text-green-600', bg: 'bg-green-50', desc: 'Within clearance' },
            { label: 'Write Access', value: accessible.length, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Authorized writes' },
            { label: 'Restricted', value: allReturns.length - accessible.length, color: 'text-red-600', bg: 'bg-red-50', desc: 'Above clearance' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} rounded-lg p-4 text-center`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-600 font-medium">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN RETURNS PAGE
// ============================================================================
const AdminReturnsPage = ({ user }: { user: User }) => {
  const [returns, setReturns] = useState(demoReturns());
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Submitted', 'Under Review', 'Approved', 'Pending'];

  const filtered = filter === 'All' ? returns : returns.filter(r => r.status === filter);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tax Returns Management</h2>
          <p className="text-xs text-gray-500">Bell-LaPadula access-controlled view</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === s ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Taxpayer', 'Tax Type', 'Year', 'Gross Income', 'Tax Amount', 'Due Date', 'Status', 'Clearance', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tr, i) => {
                const canRead = BellLaPadula.canRead(user, tr);
                return (
                  <tr key={tr.id} className={`hover:bg-gray-50 transition-colors ${!canRead ? 'opacity-40 bg-gray-50' : ''}`}>
                    <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{canRead ? tr.taxpayerName : '████████████'}</p>
                      <p className="text-gray-400 text-[10px]">{canRead ? `ID: ${tr.taxpayerId}` : '████'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate">{canRead ? tr.taxType : '████████'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{tr.taxYear}</td>
                    <td className="px-4 py-3 text-xs font-medium">{canRead ? fmt(tr.grossIncome) : '████████'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-700">{canRead ? fmt(tr.taxAmount) : '████████'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{tr.dueDate ? fmtDate(tr.dueDate) : '—'}</td>
                    <td className="px-4 py-3">{canRead ? <StatusBadge status={tr.status} /> : <span className="text-gray-300 text-xs">Restricted</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BellLaPadula.getLevelBg(tr.securityLevel)}`}>
                        {BellLaPadula.getLevelName(tr.securityLevel)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canRead ? (
                        <div className="flex gap-1">
                          <button className="p-1 text-blue-500 hover:text-blue-700 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1 text-green-500 hover:text-green-700 transition-colors"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button className="p-1 text-red-400 hover:text-red-600 transition-colors"><XCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : <EyeOff className="w-3.5 h-3.5 text-red-300" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {filtered.length} of {returns.length} returns</p>
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs border rounded hover:bg-gray-100"><ChevronLeft className="w-3 h-3" /></button>
            <button className="px-2 py-1 text-xs border rounded bg-green-800 text-white">1</button>
            <button className="px-2 py-1 text-xs border rounded hover:bg-gray-100"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN USERS PAGE
// ============================================================================
const AdminUsersPage = ({ user }: { user: User }) => (
  <div className="p-6 space-y-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">User Management</h2>
        <p className="text-xs text-gray-500">Manage all system users and their access levels</p>
      </div>
      <button className="flex items-center gap-1.5 text-xs bg-green-800 hover:bg-green-700 text-white rounded-lg px-3 py-2 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add User
      </button>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Total Users', value: '3', icon: Users, color: 'bg-blue-50 text-blue-700' },
        { label: 'Active Sessions', value: '1', icon: Activity, color: 'bg-green-50 text-green-700' },
        { label: 'Security Alerts', value: '0', icon: AlertCircle, color: 'bg-orange-50 text-orange-700' },
      ].map(item => (
        <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">All Users</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {demoUsers.map(u => (
          <div key={u.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm">
                {u.name[0]}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
                {u.tin && <p className="text-[10px] text-gray-400">TIN: {u.tin}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BellLaPadula.getLevelBg(u.securityLevel)}`}>
                {BellLaPadula.getLevelName(u.securityLevel)}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">{u.role}</span>
              <div className="flex gap-1">
                <button className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 text-green-500 hover:text-green-700 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// ADMIN REPORTS PAGE
// ============================================================================
const AdminReportsPage = ({ user }: { user: User }) => {
  const returns = BellLaPadula.filterReadable(user, demoReturns());
  const total = returns.reduce((s, r) => s + r.taxAmount, 0);
  const byType: Record<string, number> = {};
  returns.forEach(r => { byType[r.taxType] = (byType[r.taxType] || 0) + r.taxAmount; });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Revenue Reports & Analytics</h2>
        <p className="text-xs text-gray-500">Fiscal Year 2024 — Based on your security clearance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(total), icon: DollarSign },
          { label: 'Returns Processed', value: returns.length.toString(), icon: FileText },
          { label: 'Avg Tax Amount', value: returns.length ? fmt(total / returns.length) : '₦0', icon: Calculator },
          { label: 'Compliance Rate', value: '87.3%', icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-green-700" />
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue by Tax Type</h3>
        <div className="space-y-3">
          {Object.entries(byType).map(([type, amount]) => {
            const pct = Math.round((amount / total) * 100);
            return (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">{type}</span>
                  <span className="text-xs font-semibold text-gray-800">{fmt(amount)} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-700 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Approved', count: returns.filter(r => r.status === 'Approved').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Under Review', count: returns.filter(r => r.status === 'Under Review').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Submitted', count: returns.filter(r => r.status === 'Submitted').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', count: returns.filter(r => r.status === 'Pending').length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 text-xs bg-green-800 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
        <button className="flex items-center gap-2 text-xs border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print Report
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STAFF QUEUE
// ============================================================================
const StaffQueue = ({ user }: { user: User }) => {
  const returns = BellLaPadula.filterReadable(user, demoReturns());
  const queue = returns.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setStatuses(prev => ({ ...prev, [id]: action === 'approve' ? 'Approved' : 'Rejected' }));
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Review Queue</h2>
        <p className="text-xs text-gray-500">{queue.length} returns awaiting review</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: queue.length, icon: Clock, color: 'bg-orange-50 text-orange-700' },
          { label: 'Total Accessible', value: returns.length, icon: Eye, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Value', value: fmt(returns.reduce((s, r) => s + r.taxAmount, 0)), icon: DollarSign, color: 'bg-green-50 text-green-700' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {queue.map(tr => {
          const localStatus = statuses[tr.id];
          return (
            <div key={tr.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-xs">
                    {tr.taxpayerName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{tr.taxpayerName}</p>
                    <p className="text-xs text-gray-400">{tr.taxType} — {tr.taxYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={localStatus || tr.status} />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BellLaPadula.getLevelBg(tr.securityLevel)}`}>
                    {BellLaPadula.getLevelName(tr.securityLevel)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Gross Income</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{fmt(tr.grossIncome)}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Tax Amount</p><p className="font-semibold text-sm text-green-700 mt-0.5">{fmt(tr.taxAmount)}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Filed Date</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{fmtDate(tr.filingDate)}</p></div>
              </div>
              {!localStatus && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(tr.id, 'approve')}
                    className="flex items-center gap-1.5 text-xs bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => handleAction(tr.id, 'reject')}
                    className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button className="flex items-center gap-1.5 text-xs border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              )}
              {localStatus && (
                <p className={`text-xs font-semibold ${localStatus === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Return has been {localStatus.toLowerCase()}
                </p>
              )}
            </div>
          );
        })}
        {queue.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">All caught up!</p>
            <p className="text-xs text-gray-400">No returns pending review within your clearance level</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TAXPAYER DASHBOARD
// ============================================================================
const TaxpayerDashboard = ({ user, onNavigate }: { user: User; onNavigate: (p: PageType) => void }) => {
  const returns = demoReturns().filter(r => r.taxpayerId === user.id);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-green-200 text-xs mb-1">Welcome back</p>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-green-200 text-xs mt-1">TIN: {user.tin} • {user.role}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('file-return')}
              className="bg-white text-green-800 hover:bg-green-50 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> File Return
            </button>
            <button onClick={() => onNavigate('payment')}
              className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pay Tax
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tax Paid', value: fmt(returns.reduce((s, r) => s + r.taxAmount, 0)), icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Returns Filed', value: returns.length.toString(), icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Pending Returns', value: returns.filter(r => r.status === 'Submitted').length.toString(), icon: Clock, color: 'text-orange-700', bg: 'bg-orange-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Plus, label: 'File Tax Return', desc: 'Submit 2024 return', page: 'file-return' as PageType, color: 'hover:border-green-500' },
          { icon: CreditCard, label: 'Make Payment', desc: 'Pay outstanding tax', page: 'payment' as PageType, color: 'hover:border-blue-500' },
          { icon: FileText, label: 'View History', desc: 'Past returns & receipts', page: 'history' as PageType, color: 'hover:border-purple-500' },
          { icon: Calculator, label: 'Tax Calculator', desc: 'Estimate your tax', page: 'dashboard' as PageType, color: 'hover:border-orange-500' },
        ].map(action => (
          <button key={action.label} onClick={() => onNavigate(action.page)}
            className={`bg-white border border-gray-200 rounded-xl p-4 text-left transition-all hover:shadow-md ${action.color}`}>
            <action.icon className="w-5 h-5 text-green-700 mb-2" />
            <p className="text-xs font-semibold text-gray-800">{action.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent returns */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">My Tax Returns</h3>
          <button onClick={() => onNavigate('history')} className="text-xs text-green-700 font-medium hover:text-green-800 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {returns.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No returns filed yet</p>
            <button onClick={() => onNavigate('file-return')}
              className="mt-3 text-xs bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              File Your First Return
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {returns.map(tr => (
              <div key={tr.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{tr.taxType}</p>
                    <p className="text-[10px] text-gray-400">Year {tr.taxYear} • Filed {fmtDate(tr.filingDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-700">{fmt(tr.taxAmount)}</p>
                    <p className="text-[10px] text-gray-400">Tax Amount</p>
                  </div>
                  <StatusBadge status={tr.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important notices */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Tax Filing Reminder</p>
            <p className="text-xs text-amber-700 mt-0.5">The deadline for filing your 2024 Personal Income Tax return is <strong>June 30, 2026</strong>. File early to avoid penalties.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FILE RETURN PAGE
// ============================================================================
const FileReturnPage = ({ user, onNavigate }: { user: User; onNavigate: (p: PageType) => void }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ taxType: TaxType.PersonalIncome, taxYear: 2024, grossIncome: 0, deductions: 0, otherIncome: 0 });

  const taxable = form.grossIncome + form.otherIncome - form.deductions;
  const taxAmount = calcTax(Math.max(0, taxable));

  const handleSubmit = () => { setSubmitted(true); };

  if (submitted) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Return Submitted Successfully!</h2>
        <p className="text-sm text-gray-500 mb-2">Your tax return has been submitted for review.</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">Reference No.</span><span className="text-xs font-mono font-bold text-gray-800">NRS-2024-{Math.floor(Math.random() * 90000) + 10000}</span></div>
          <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">Tax Amount</span><span className="text-xs font-bold text-green-700">{fmt(taxAmount)}</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span><StatusBadge status="Submitted" /></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onNavigate('payment')}
            className="text-xs bg-green-800 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Pay Now
          </button>
          <button onClick={() => onNavigate('dashboard')}
            className="text-xs border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">File Tax Return</h2>
        <p className="text-xs text-gray-500">Complete all required fields below</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-green-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s ? 'bg-green-700 text-white' : step === s ? 'bg-green-800 text-white ring-2 ring-green-200' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className="text-xs font-medium hidden sm:block">{['Tax Info', 'Income Details', 'Review'][s - 1]}</span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-green-700' : 'bg-gray-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Step 1: Tax Information</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tax Type <span className="text-red-500">*</span></label>
              <select value={form.taxType} onChange={e => setForm({ ...form, taxType: e.target.value as TaxType })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {Object.values(TaxType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tax Year <span className="text-red-500">*</span></label>
              <select value={form.taxYear} onChange={e => setForm({ ...form, taxYear: +e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {[2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-semibold flex items-center gap-1"><Info className="w-3 h-3" /> Taxpayer Information</p>
              <p className="text-xs text-blue-600 mt-1">TIN: {user.tin} • Name: {user.name}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Step 2: Income Details</h3>
            {[
              { label: 'Gross Income (₦)', key: 'grossIncome', placeholder: '5000000' },
              { label: 'Other Income (₦)', key: 'otherIncome', placeholder: '0' },
              { label: 'Allowable Deductions (₦)', key: 'deductions', placeholder: '500000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input type="number" value={(form as any)[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            ))}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-gray-600">Total Income:</span><span className="font-semibold">{fmt(form.grossIncome + form.otherIncome)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-600">Less Deductions:</span><span className="font-semibold text-red-600">-{fmt(form.deductions)}</span></div>
              <div className="border-t border-green-200 pt-2 flex justify-between text-sm"><span className="font-semibold text-gray-700">Taxable Income:</span><span className="font-bold">{fmt(Math.max(0, taxable))}</span></div>
              <div className="flex justify-between text-sm"><span className="font-semibold text-gray-700">Estimated Tax:</span><span className="font-bold text-green-700">{fmt(taxAmount)}</span></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Step 3: Review & Submit</h3>
            {[
              ['Taxpayer Name', user.name],
              ['TIN', user.tin || '—'],
              ['Tax Type', form.taxType],
              ['Tax Year', form.taxYear.toString()],
              ['Gross Income', fmt(form.grossIncome)],
              ['Deductions', fmt(form.deductions)],
              ['Taxable Income', fmt(Math.max(0, taxable))],
              ['Tax Amount Due', fmt(taxAmount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-xs font-semibold ${label === 'Tax Amount Due' ? 'text-green-700' : 'text-gray-800'}`}>{value}</span>
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">By submitting, I declare the information above is true and correct to the best of my knowledge.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 text-xs border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 text-xs bg-green-800 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="flex items-center gap-1.5 text-xs bg-green-800 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
              <Check className="w-3.5 h-3.5" /> Submit Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAYMENT PAGE
// ============================================================================
const PaymentPage = ({ user, onNavigate }: { user: User; onNavigate: (p: PageType) => void }) => {
  const [method, setMethod] = useState<'card' | 'bank' | 'ussd' | null>(null);
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState({ bank: '', account: '', name: '' });
  const [paid, setPaid] = useState(false);
  const amount = 1560000;

  if (paid) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mb-4">Your tax payment has been processed.</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">Amount Paid</span><span className="text-xs font-bold text-green-700">{fmt(amount)}</span></div>
          <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">Transaction Ref</span><span className="text-xs font-mono">TXN-{Date.now().toString().slice(-8)}</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">Method</span><span className="text-xs font-semibold capitalize">{method}</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button className="text-xs border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Receipt
          </button>
          <button onClick={() => onNavigate('dashboard')}
            className="text-xs bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Make Tax Payment</h2>
        <p className="text-xs text-gray-500">Secure payment processing</p>
      </div>

      {/* Amount */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div><p className="text-xs text-gray-500 mb-0.5">Amount Due</p><p className="text-2xl font-bold text-green-800">{fmt(amount)}</p></div>
        <div className="text-right"><p className="text-xs text-gray-500">TIN</p><p className="text-sm font-mono font-semibold text-gray-700">{user.tin}</p></div>
      </div>

      {!method ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-700 mb-3">Select Payment Method:</p>
          {[
            { id: 'card' as const, icon: CreditCard, label: 'Debit / Credit Card', desc: 'Visa, Mastercard, Verve accepted', color: 'text-green-600' },
            { id: 'bank' as const, icon: Building2, label: 'Bank Transfer', desc: 'Direct transfer from your account', color: 'text-blue-600' },
            { id: 'ussd' as const, icon: Smartphone, label: 'USSD Payment', desc: 'Dial *737# or *894#', color: 'text-purple-600' },
          ].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm text-gray-800">
              {method === 'card' ? 'Card Payment' : method === 'bank' ? 'Bank Transfer' : 'USSD Payment'}
            </h3>
            <button onClick={() => setMethod(null)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Change
            </button>
          </div>

          {method === 'card' && (
            <div className="space-y-3">
              {[
                { label: 'Card Number', key: 'number', type: 'text', placeholder: '0000 0000 0000 0000' },
                { label: 'Cardholder Name', key: 'name', type: 'text', placeholder: 'JOHN DOE' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(card as any)[f.key]} placeholder={f.placeholder}
                    onChange={e => setCard({ ...card, [f.key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <input value={card.expiry} placeholder="MM/YY" onChange={e => setCard({ ...card, expiry: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                  <input type="password" value={card.cvv} placeholder="•••" onChange={e => setCard({ ...card, cvv: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>
          )}

          {method === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Bank</label>
                <select value={bank.bank} onChange={e => setBank({ ...bank, bank: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Choose bank...</option>
                  {['GTBank', 'First Bank', 'Zenith Bank', 'UBA', 'Access Bank', 'Fidelity Bank'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Account Number', key: 'account', placeholder: '0123456789' },
                { label: 'Account Name', key: 'name', placeholder: 'John Doe' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  <input value={(bank as any)[f.key]} placeholder={f.placeholder}
                    onChange={e => setBank({ ...bank, [f.key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
            </div>
          )}

          {method === 'ussd' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-purple-600" />
              </div>
              <p className="font-bold text-gray-800 mb-2">Dial to pay:</p>
              <p className="text-2xl font-mono font-black text-purple-700 mb-4">*737*1*{fmt(amount).replace(/[₦,]/g, '')}#</p>
              <p className="text-xs text-gray-500">Follow the prompts on your phone to complete payment</p>
            </div>
          )}

          <button onClick={() => setPaid(true)}
            className="w-full mt-5 bg-green-800 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Pay {fmt(amount)} Securely
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2">🔒 256-bit SSL encrypted payment</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HISTORY PAGE
// ============================================================================
const HistoryPage = ({ user }: { user: User }) => {
  const returns = demoReturns().filter(r => r.taxpayerId === user.id);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tax History</h2>
          <p className="text-xs text-gray-500">All your previous filings and payments</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export History
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No tax history found</p>
          <p className="text-xs text-gray-400 mt-1">Your filed returns will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map(tr => (
            <div key={tr.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{tr.taxType}</p>
                    <p className="text-xs text-gray-400">Year {tr.taxYear}</p>
                  </div>
                </div>
                <StatusBadge status={tr.status} />
              </div>
              <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-xs">
                <div><p className="text-gray-400 mb-0.5">Gross Income</p><p className="font-semibold text-gray-800">{fmt(tr.grossIncome)}</p></div>
                <div><p className="text-gray-400 mb-0.5">Tax Amount</p><p className="font-semibold text-green-700">{fmt(tr.taxAmount)}</p></div>
                <div><p className="text-gray-400 mb-0.5">Filed Date</p><p className="font-semibold text-gray-800">{fmtDate(tr.filingDate)}</p></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <Eye className="w-3 h-3" /> View Details
                </button>
                <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors ml-3">
                  <Download className="w-3 h-3" /> Download Receipt
                </button>
                <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors ml-3">
                  <Printer className="w-3 h-3" /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROFILE PAGE
// ============================================================================
const ProfilePage = ({ user }: { user: User }) => (
  <div className="p-6 max-w-xl">
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
      <p className="text-xs text-gray-500">Manage your account information and security</p>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="bg-green-800 h-20"></div>
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-4 flex items-end gap-4">
          <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center bg-green-700 text-white text-2xl font-bold">
            {user.name[0]}
          </div>
          <div className="mb-1">
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role} • {user.department || 'NRS Portal'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            ['Email', user.email],
            ['Phone', user.phone || '+234 800 000 0000'],
            ['TIN', user.tin || 'N/A (Staff Account)'],
            ['Department', user.department || 'General'],
            ['Security Level', `Level ${user.securityLevel}: ${BellLaPadula.getLevelName(user.securityLevel)}`],
            ['Role', user.role],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
              <p className="font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-green-700" /> Security Clearance</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Current Level</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BellLaPadula.getLevelBg(user.securityLevel)}`}>
            {BellLaPadula.getLevelName(user.securityLevel)}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1.5">Authorized Labels:</p>
          <div className="flex flex-wrap gap-1.5">
            {user.securityLabels.map(l => (
              <span key={l} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <button className="text-xs bg-green-800 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5">
      <Edit className="w-3.5 h-3.5" /> Edit Profile
    </button>
  </div>
);

// ============================================================================
// DASHBOARD WRAPPER
// ============================================================================
const DashboardWrapper = ({ user, activePage, onNavigate, onLogout }: {
  user: User; activePage: PageType; onNavigate: (p: PageType) => void; onLogout: () => void;
}) => {
  const titles: Partial<Record<PageType, string>> = {
    dashboard: `${user.role} Dashboard`,
    'admin-returns': 'Tax Returns Management',
    'admin-users': 'User Management',
    'admin-reports': 'Revenue Reports',
    'staff-queue': 'Review Queue',
    'file-return': 'File Tax Return',
    payment: 'Make Payment',
    history: 'Tax History',
    profile: 'Profile Settings',
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        if (user.role === UserRole.Admin) return <AdminDashboard user={user} onNavigate={onNavigate} />;
        if (user.role === UserRole.Staff) return <StaffQueue user={user} />;
        return <TaxpayerDashboard user={user} onNavigate={onNavigate} />;
      case 'admin-returns': return <AdminReturnsPage user={user} />;
      case 'admin-users': return <AdminUsersPage user={user} />;
      case 'admin-reports': return <AdminReportsPage user={user} />;
      case 'staff-queue': return <StaffQueue user={user} />;
      case 'file-return': return <FileReturnPage user={user} onNavigate={onNavigate} />;
      case 'payment': return <PaymentPage user={user} onNavigate={onNavigate} />;
      case 'history': return <HistoryPage user={user} />;
      case 'profile': return <ProfilePage user={user} />;
      default: return <TaxpayerDashboard user={user} onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar user={user} activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} title={titles[activePage] || 'Dashboard'} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function NRSTaxSystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageType>('home');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('home');
  };

  const handleNavigate = (p: PageType) => {
    if (p === 'login' && !currentUser) { setPage('login'); return; }
    setPage(p);
  };

  // Redirect to login if accessing protected pages without auth
  useEffect(() => {
    const protectedPages: PageType[] = ['dashboard', 'file-return', 'payment', 'history', 'profile', 'admin-returns', 'admin-users', 'admin-reports', 'staff-queue'];
    if (!currentUser && protectedPages.includes(page)) setPage('login');
  }, [page, currentUser]);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {page !== 'login' && !['dashboard', 'file-return', 'payment', 'history', 'profile', 'admin-returns', 'admin-users', 'admin-reports', 'staff-queue'].includes(page) && (
        <>
          <AnnouncementBar />
          <Navbar onNavigate={handleNavigate} currentUser={currentUser} onLogin={() => setPage('login')} onLogout={handleLogout} />
        </>
      )}

      {page === 'home' && <HomePage onNavigate={handleNavigate} currentUser={currentUser} />}
      {page === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentUser && ['dashboard', 'file-return', 'payment', 'history', 'profile', 'admin-returns', 'admin-users', 'admin-reports', 'staff-queue'].includes(page) && (
        <DashboardWrapper user={currentUser} activePage={page} onNavigate={handleNavigate} onLogout={handleLogout} />
      )}
    </div>
  );
}