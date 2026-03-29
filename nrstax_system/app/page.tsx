'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../public/images/logo.jpg';
import { 
  Shield, Users, FileText, DollarSign, TrendingUp, Settings,
  Bell, LogOut, Search, Plus, Eye, EyeOff, Download, Upload,
  CreditCard, Building2, Smartphone, Check, X, Edit, Trash2,
  BarChart3, PieChart, Calendar, Filter, ChevronDown, Menu
} from 'lucide-react';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

enum SecurityLevel {
  Public = 0,
  Internal = 1,
  Confidential = 2,
  Restricted = 3,
  TopSecret = 4
}

enum SecurityLabel {
  Financial = 'Financial',
  Personal = 'Personal',
  Audit = 'Audit',
  Operations = 'Operations',
  Management = 'Management'
}

enum UserRole {
  Taxpayer = 'Taxpayer',
  Staff = 'Staff',
  Admin = 'Admin'
}

enum TaxType {
  PersonalIncome = 'Personal Income Tax',
  Corporate = 'Corporate Tax',
  VAT = 'Value Added Tax',
  WithholdingTax = 'Withholding Tax'
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  securityLevel: SecurityLevel;
  securityLabels: SecurityLabel[];
  tin?: string;
  department?: string;
}

interface TaxReturn {
  id: string;
  taxpayerId: string;
  taxpayerName: string;
  taxYear: number;
  taxType: TaxType;
  grossIncome: number;
  taxAmount: number;
  status: string;
  filingDate: Date;
  securityLevel: SecurityLevel;
  securityLabels: SecurityLabel[];
}

interface Payment {
  id: string;
  taxpayerId: string;
  amount: number;
  method: string;
  date: Date;
  status: string;
  transactionRef: string;
}

// ============================================================================
// BELL-LAPADULA ACCESS CONTROL
// ============================================================================

class BellLaPadula {
  static canRead(user: User, resource: any): boolean {
    const levelCheck = user.securityLevel >= resource.securityLevel;
    const labelCheck = resource.securityLabels?.every((label: SecurityLabel) => 
      user.securityLabels.includes(label)
    ) ?? true;
    return levelCheck && labelCheck;
  }

  static canWrite(user: User, resource: any): boolean {
    const levelCheck = resource.securityLevel >= user.securityLevel;
    const labelCheck = user.securityLabels.every(label => 
      resource.securityLabels?.includes(label) ?? false
    );
    return levelCheck && labelCheck;
  }

  static filterReadable<T extends { securityLevel: SecurityLevel; securityLabels?: SecurityLabel[] }>(
    user: User, 
    items: T[]
  ): T[] {
    return items.filter(item => this.canRead(user, item));
  }

  static getSecurityBadgeColor(level: SecurityLevel): string {
    const colors = {
      [SecurityLevel.Public]: 'bg-gray-500',
      [SecurityLevel.Internal]: 'bg-blue-500',
      [SecurityLevel.Confidential]: 'bg-yellow-600',
      [SecurityLevel.Restricted]: 'bg-orange-600',
      [SecurityLevel.TopSecret]: 'bg-red-600'
    };
    return colors[level];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-NG').format(date);
};

const generateTIN = () => {
  return `NRS${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const calculateTax = (income: number): number => {
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
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@nrs.gov.ng',
    role: UserRole.Admin,
    securityLevel: SecurityLevel.TopSecret,
    securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal, SecurityLabel.Audit, SecurityLabel.Operations, SecurityLabel.Management]
  },
  {
    id: '2',
    name: 'Tax Officer',
    email: 'officer@nrs.gov.ng',
    role: UserRole.Staff,
    department: 'Tax Administration',
    securityLevel: SecurityLevel.Confidential,
    securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal, SecurityLabel.Operations]
  },
  {
    id: '3',
    name: 'Tax Payer',
    email: 'john@example.com',
    role: UserRole.Taxpayer,
    tin: 'NRS20240001',
    securityLevel: SecurityLevel.Internal,
    securityLabels: [SecurityLabel.Personal]
  }
];

const generateDemoTaxReturns = (): TaxReturn[] => [
  {
    id: '1',
    taxpayerId: '3',
    taxpayerName: 'John Doe',
    taxYear: 2024,
    taxType: TaxType.PersonalIncome,
    grossIncome: 5000000,
    taxAmount: calculateTax(5000000),
    status: 'Submitted',
    filingDate: new Date('2024-03-15'),
    securityLevel: SecurityLevel.Internal,
    securityLabels: [SecurityLabel.Personal]
  },
  {
    id: '2',
    taxpayerId: '4',
    taxpayerName: 'ABC Corporation',
    taxYear: 2024,
    taxType: TaxType.Corporate,
    grossIncome: 50000000,
    taxAmount: 15000000,
    status: 'Under Review',
    filingDate: new Date('2024-04-01'),
    securityLevel: SecurityLevel.Confidential,
    securityLabels: [SecurityLabel.Financial, SecurityLabel.Personal]
  },
  {
    id: '3',
    taxpayerId: '5',
    taxpayerName: 'XYZ Ltd',
    taxYear: 2024,
    taxType: TaxType.VAT,
    grossIncome: 100000000,
    taxAmount: 7500000,
    status: 'Approved',
    filingDate: new Date('2024-05-10'),
    securityLevel: SecurityLevel.Restricted,
    securityLabels: [SecurityLabel.Financial, SecurityLabel.Audit]
  }
];

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  // 1. Add the type property here
  type?: "button" | "submit" | "reset"; 
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  icon, 
  disabled, 
  type = 'button' // 2. Destructure with a default value
}) => {
  const variants = {
    primary: 'bg-green-700 hover:bg-green-800 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      type={type} // 3. Pass the type to the actual HTML button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

const Input: React.FC<{
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  </div>
);

const Select: React.FC<{
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const SecurityBadge: React.FC<{ level: SecurityLevel; labels?: SecurityLabel[] }> = ({ level, labels }) => (
  <div className="flex items-center gap-2">
    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${BellLaPadula.getSecurityBadgeColor(level)}`}>
      <Shield className="inline h-3 w-3 mr-1" />
      {SecurityLevel[level]}
    </span>
    {labels && labels.map((label, i) => (
      <span key={i} className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
        {label}
      </span>
    ))}
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

// ============================================================================
// HEADER COMPONENT
// ============================================================================

const Header: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 bg-green-700 flex items-left justify-center">
           <Image 
        src={logo} 
        alt="Description of my image" 
        width={200} 
        height={400} 
      />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nigeria Revenue Service</h1>
            <p className="text-xs text-gray-600">Tax Payment & Management System</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="secondary" icon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  </header>
);

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>(generateDemoTaxReturns());
  const [selectedReturn, setSelectedReturn] = useState<TaxReturn | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const accessibleReturns = BellLaPadula.filterReadable(user, taxReturns);
  const totalRevenue = accessibleReturns.reduce((sum, r) => sum + r.taxAmount, 0);
  const approvedReturns = accessibleReturns.filter(r => r.status === 'Approved').length;
  const pendingReturns = accessibleReturns.filter(r => r.status === 'Submitted').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <SecurityBadge level={user.securityLevel} labels={user.securityLabels} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-600"
        />
        <StatCard
          title="Total Returns"
          value={accessibleReturns.length}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Approved"
          value={approvedReturns}
          icon={<Check className="h-6 w-6 text-white" />}
          color="bg-green-500"
          subtitle="Returns approved"
        />
        <StatCard
          title="Pending Review"
          value={pendingReturns}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-orange-500"
          subtitle="Awaiting action"
        />
      </div>

      <Card title="Tax Returns Management">
        <div className="mb-4 flex gap-2">
          <Button icon={<Search className="h-4 w-4" />} variant="secondary">Search</Button>
          <Button icon={<Filter className="h-4 w-4" />} variant="secondary">Filter</Button>
          <Button icon={<Download className="h-4 w-4" />} variant="secondary">Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Taxpayer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Income</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tax Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Security</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxReturns.map(tr => {
                const canRead = BellLaPadula.canRead(user, tr);
                return (
                  <tr key={tr.id} className={!canRead ? 'opacity-50 bg-gray-50' : ''}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{canRead ? tr.taxpayerName : '████████'}</p>
                        <p className="text-sm text-gray-600">{canRead ? tr.taxpayerId : '████'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{canRead ? tr.taxType : '████████'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{canRead ? formatCurrency(tr.grossIncome) : '████████'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{canRead ? formatCurrency(tr.taxAmount) : '████████'}</td>
                    <td className="px-4 py-3">
                      {canRead ? (
                        <Badge variant={tr.status === 'Approved' ? 'success' : tr.status === 'Submitted' ? 'warning' : 'info'}>
                          {tr.status}
                        </Badge>
                      ) : '████'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${BellLaPadula.getSecurityBadgeColor(tr.securityLevel)} text-white`}>
                        Level {tr.securityLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canRead ? (
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Bell-LaPadula Access Control Status">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{accessibleReturns.length}</p>
            <p className="text-sm text-gray-600">Can Read</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{accessibleReturns.length}</p>
            <p className="text-sm text-gray-600">Can Write</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{taxReturns.length - accessibleReturns.length}</p>
            <p className="text-sm text-gray-600">Restricted</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StaffDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [taxReturns] = useState<TaxReturn[]>(generateDemoTaxReturns());
  const accessibleReturns = BellLaPadula.filterReadable(user, taxReturns);
  const pendingReview = accessibleReturns.filter(r => r.status === 'Submitted' || r.status === 'Under Review');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Dashboard</h2>
        <SecurityBadge level={user.securityLevel} labels={user.securityLabels} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending Review"
          value={pendingReview.length}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-orange-600"
        />
        <StatCard
          title="Accessible Returns"
          value={accessibleReturns.length}
          icon={<Eye className="h-6 w-6 text-white" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(accessibleReturns.reduce((sum, r) => sum + r.taxAmount, 0))}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-600"
        />
      </div>

      <Card title="Tax Returns Review Queue">
        <div className="space-y-4">
          {pendingReview.map(tr => (
            <div key={tr.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{tr.taxpayerName}</h4>
                    <Badge variant={tr.status === 'Submitted' ? 'warning' : 'info'}>{tr.status}</Badge>
                    <SecurityBadge level={tr.securityLevel} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tax Type</p>
                      <p className="font-medium">{tr.taxType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gross Income</p>
                      <p className="font-medium">{formatCurrency(tr.grossIncome)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tax Amount</p>
                      <p className="font-medium text-green-600">{formatCurrency(tr.taxAmount)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" icon={<Check className="h-4 w-4" />}>Approve</Button>
                  <Button variant="danger" icon={<X className="h-4 w-4" />}>Reject</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const TaxpayerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [showFileReturn, setShowFileReturn] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [taxReturns] = useState<TaxReturn[]>(
    generateDemoTaxReturns().filter(tr => tr.taxpayerId === user.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Taxpayer Dashboard</h2>
        <p className="text-gray-600">TIN: {user.tin}</p>
        <SecurityBadge level={user.securityLevel} labels={user.securityLabels} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Tax Paid"
          value={formatCurrency(0)}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-600"
        />
        <StatCard
          title="Pending Returns"
          value={taxReturns.filter(r => r.status === 'Submitted').length}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-orange-600"
        />
        <StatCard
          title="Total Returns"
          value={taxReturns.length}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          color="bg-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <button
            onClick={() => setShowFileReturn(true)}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <Plus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-gray-700">File New Tax Return</p>
            <p className="text-sm text-gray-500">Submit your tax return for 2024</p>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-gray-700">Make Payment</p>
            <p className="text-sm text-gray-500">Pay your tax using Card or Bank Transfer</p>
          </button>
        </Card>
      </div>

      {showFileReturn && <TaxReturnForm user={user} onClose={() => setShowFileReturn(false)} />}
      {showPayment && <PaymentForm onClose={() => setShowPayment(false)} />}

      <Card title="My Tax Returns">
        {taxReturns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No tax returns filed yet</p>
            <Button className="mt-4" onClick={() => setShowFileReturn(true)}>
              File Your First Return
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {taxReturns.map(tr => (
              <div key={tr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{tr.taxType}</p>
                    <p className="text-sm text-gray-600">Year: {tr.taxYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(tr.taxAmount)}</p>
                    <Badge variant={tr.status === 'Approved' ? 'success' : 'warning'}>{tr.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ============================================================================
// FORMS
// ============================================================================

const TaxReturnForm: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    taxType: TaxType.PersonalIncome,
    taxYear: 2024,
    grossIncome: 0,
    deductions: 0
  });

  const taxableIncome = formData.grossIncome - formData.deductions;
  const taxAmount = calculateTax(taxableIncome);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tax Return Submitted!\nTax Amount: ${formatCurrency(taxAmount)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">File Tax Return</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <Select
              label="Tax Type"
              value={formData.taxType}
              onChange={e => setFormData({ ...formData, taxType: e.target.value as TaxType })}
              options={[
                { value: TaxType.PersonalIncome, label: 'Personal Income Tax' },
                { value: TaxType.Corporate, label: 'Corporate Tax' },
                { value: TaxType.VAT, label: 'Value Added Tax' },
                { value: TaxType.WithholdingTax, label: 'Withholding Tax' }
              ]}
              required
            />

            <Input
              label="Tax Year"
              type="number"
              value={formData.taxYear}
              onChange={e => setFormData({ ...formData, taxYear: parseInt(e.target.value) })}
              required
            />

            <Input
              label="Gross Income (₦)"
              type="number"
              value={formData.grossIncome}
              onChange={e => setFormData({ ...formData, grossIncome: parseFloat(e.target.value) || 0 })}
              placeholder="5000000"
              required
            />

            <Input
              label="Deductions (₦)"
              type="number"
              value={formData.deductions}
              onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
              placeholder="500000"
            />

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Taxable Income</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(taxableIncome)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tax Amount</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(taxAmount)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">Submit Return</Button>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PaymentForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bankDetails, setBankDetails] = useState({ bank: '', account: '', name: '' });

  const handlePayment = () => {
    alert(`Payment of ₦500,000 processed successfully via ${paymentMethod}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Make Payment</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Amount Due:</span>
              <span className="text-2xl font-bold text-blue-600">₦500,000.00</span>
            </div>
          </div>

          {!paymentMethod ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select payment method:</p>
              
              <button
                onClick={() => setPaymentMethod('card')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-start gap-4"
              >
                <CreditCard className="h-6 w-6 text-green-600 mt-1" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Card Payment</p>
                  <p className="text-sm text-gray-600">Pay with Debit/Credit Card (Visa, Mastercard, Verve)</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-start gap-4"
              >
                <Building2 className="h-6 w-6 text-blue-600 mt-1" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-600">Direct transfer from your bank account</p>
                </div>
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-start gap-4">
                <Smartphone className="h-6 w-6 text-purple-600 mt-1" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">USSD Payment</p>
                  <p className="text-sm text-gray-600">Pay using mobile banking (*737# or *894#)</p>
                </div>
              </button>
            </div>
          ) : paymentMethod === 'card' ? (
            <div>
              <Input
                label="Card Number"
                value={cardDetails.number}
                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                placeholder="5399 8765 4321 0987"
                required
              />
              <Input
                label="Cardholder Name"
                value={cardDetails.name}
                onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="JOHN DOE"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  value={cardDetails.expiry}
                  onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  placeholder="MM/YY"
                  required
                />
                <Input
                  label="CVV"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  placeholder="123"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handlePayment} variant="success" className="flex-1">
                  Pay ₦500,000
                </Button>
                <Button onClick={() => setPaymentMethod(null)} variant="secondary">Back</Button>
              </div>
            </div>
          ) : (
            <div>
              <Select
                label="Select Bank"
                value={bankDetails.bank}
                onChange={e => setBankDetails({ ...bankDetails, bank: e.target.value })}
                options={[
                  { value: '', label: 'Choose bank...' },
                  { value: 'gtb', label: 'GTBank' },
                  { value: 'firstbank', label: 'First Bank' },
                  { value: 'zenith', label: 'Zenith Bank' },
                  { value: 'uba', label: 'UBA' },
                  { value: 'access', label: 'Access Bank' }
                ]}
                required
              />
              <Input
                label="Account Number"
                value={bankDetails.account}
                onChange={e => setBankDetails({ ...bankDetails, account: e.target.value })}
                placeholder="0123456789"
                required
              />
              <Input
                label="Account Name"
                value={bankDetails.name}
                onChange={e => setBankDetails({ ...bankDetails, name: e.target.value })}
                placeholder="John Doe"
                required
              />
              <div className="flex gap-3 mt-6">
                <Button onClick={handlePayment} variant="success" className="flex-1">
                  Confirm Transfer
                </Button>
                <Button onClick={() => setPaymentMethod(null)} variant="secondary">Back</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function NRSTaxSystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string>('');

  const handleLogin = (role: string) => {
    const user = demoUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUserRole('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <Header user={null} onLogout={() => {}} />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to NRS Tax System</h2>
            <p className="text-lg text-gray-600 mb-2">Nigeria Revenue Service - Tax Payment & Management</p>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Shield className="h-4 w-4" />
              Secured with Bell-LaPadula Access Control
            </div>
          </div>

          <Card className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-semibold mb-2">🔒 Multi-Level Security Implementation</p>
              <p className="text-xs text-blue-800">
                This system implements the Bell-LaPadula security model with mandatory access control. 
                Each role has different security clearances and can only access data according to their level.
              </p>
            </div>

            <div className="space-y-4">
              <p className="font-semibold text-gray-900">Select your role to login:</p>
              
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.role)}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="info">{user.role}</Badge>
                  </div>
                  <SecurityBadge level={user.securityLevel} labels={user.securityLabels} />
                  <div className="mt-3 text-sm text-gray-600">
                    {user.role === UserRole.Admin && '• Full system access • Manage all users • View all data'}
                    {user.role === UserRole.Staff && '• Review tax returns • Verify payments • Generate reports'}
                    {user.role === UserRole.Taxpayer && '• File returns • Make payments • View history'}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Bell-LaPadula Access Control Rules:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>No Read Up:</strong> Users can only read data at or below their security clearance level</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>No Write Down:</strong> Users can only write to data at or above their clearance level</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Compartmentalization:</strong> Users must have all required security labels to access data</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentUser.role === UserRole.Admin && <AdminDashboard user={currentUser} />}
        {currentUser.role === UserRole.Staff && <StaffDashboard user={currentUser} />}
        {currentUser.role === UserRole.Taxpayer && <TaxpayerDashboard user={currentUser} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            © 2026 Nigeria Revenue Service. All rights reserved. | Secured with Bell-LaPadula MAC
          </p>
        </div>
      </footer>
    </div>
  );
}