import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import PasswordInput from "../../../components/ui/PasswordInput";
import { adminAPI } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import {
    Settings,
    Shield,
    Lock,
    Building2,
    Sliders,
    History,
    CheckCircle2,
    Save,
    RotateCcw,
    Globe,
    Phone,
    Mail,
    MapPin,
    Calendar,
    KeyRound,
    UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export const InstituteSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("branding");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings form
    const [settings, setSettings] = useState({
        instituteName: "Balaji Computer",
        tagline: "Learn Today, Lead Tomorrow.",
        email: "admissions@balajicomputer.edu",
        phone: "+91 98765 43210",
        address: "Near Main Market, Coaching Center Hub, Main Road",
        city: "City Center",
        state: "State",
        pinCode: "000000",
        academicSession: "2026-2027",
        websiteUrl: "https://balajicomputer.edu",
        socialLinks: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            youtube: "https://youtube.com",
            linkedin: "https://linkedin.com",
        },
        feeReceiptPrefix: "BC-RCP",
        allowStudentRegistration: true,
    });

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Audit Logs
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsPagination, setLogsPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Fetch institute settings
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getSettings();
            if (res.success && res.settings) {
                setSettings((prev) => ({
                    ...prev,
                    ...res.settings,
                    socialLinks: {
                        ...prev.socialLinks,
                        ...(res.settings.socialLinks || {}),
                    },
                }));
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    // Fetch audit logs
    const fetchAuditLogs = async (page = 1) => {
        setLoadingLogs(true);
        try {
            const res = await adminAPI.getAuditLogs({ page, limit: 15 });
            if (res.success) {
                setAuditLogs(res.logs || []);
                setLogsPagination(res.pagination || { page: 1, pages: 1, total: 0 });
            }
        } catch {
            // non-blocking
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeTab === "audit") {
            fetchAuditLogs(1);
        }
    }, [activeTab]);

    // Save Settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await adminAPI.updateSettings(settings);
            if (res.success) {
                toast.success(res.msg || "Institute settings saved successfully");
                setSettings((prev) => ({ ...prev, ...res.settings }));
            }
        } catch (error) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    // Handle Password Change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword) {
            toast.error("Current password is required");
            return;
        }
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setChangingPassword(true);
        try {
            const res = await adminAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            if (res.success) {
                toast.success(res.msg || "Password changed successfully!");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (error) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Settings className="w-7 h-7 text-blue-600" />
                    Institute Settings & Security Administration
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Manage institute branding, academic session, receipt sequence rules, administrator credentials, and audit logs
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
                {[
                    { key: "branding", label: "Institute Profile & Branding", icon: Building2 },
                    { key: "policies", label: "Academic & Fee Policies", icon: Sliders },
                    { key: "security", label: "Admin Account & Security", icon: Shield },
                    { key: "audit", label: "System Audit Logs", icon: History },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === tab.key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: INSTITUTE PROFILE & BRANDING */}
            {activeTab === "branding" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <Card className="p-6 bg-white shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base">Institute Identity</h3>
                            <p className="text-xs text-slate-500">Public profile details displayed on website, invoices, and certificates</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Institute Name *
                                </label>
                                <input
                                    type="text"
                                    value={settings.instituteName}
                                    onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Motto / Institute Tagline *
                                </label>
                                <input
                                    type="text"
                                    value={settings.tagline}
                                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Official Email *
                                </label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Helpline Phone Number *
                                </label>
                                <input
                                    type="text"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Physical Institute Address *
                                </label>
                                <input
                                    type="text"
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Current Academic Session
                                </label>
                                <input
                                    type="text"
                                    value={settings.academicSession}
                                    onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.websiteUrl}
                                    onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Social Media Handles</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facebook Page</label>
                                    <input
                                        type="url"
                                        value={settings.socialLinks?.facebook || ""}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Instagram Profile</label>
                                    <input
                                        type="url"
                                        value={settings.socialLinks?.instagram || ""}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">YouTube Channel</label>
                                    <input
                                        type="url"
                                        value={settings.socialLinks?.youtube || ""}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        value={settings.socialLinks?.linkedin || ""}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <Button variant="primary" size="sm" type="submit" loading={saving} icon={Save}>
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </form>
            )}

            {/* TAB 2: ACADEMIC & FEE POLICIES */}
            {activeTab === "policies" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <Card className="p-6 bg-white shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base">Receipt & Registration Policies</h3>
                            <p className="text-xs text-slate-500">Configure financial receipt sequencing and admission policies</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Fee Receipt Number Prefix
                                </label>
                                <input
                                    type="text"
                                    value={settings.feeReceiptPrefix || "BC-RCP"}
                                    onChange={(e) => setSettings({ ...settings, feeReceiptPrefix: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Generated receipts format: {settings.feeReceiptPrefix || "BC-RCP"}-XXXXXX
                                </span>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="allowReg"
                                    checked={settings.allowStudentRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowStudentRegistration: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded-sm cursor-pointer"
                                />
                                <label htmlFor="allowReg" className="text-xs text-slate-700 font-bold cursor-pointer">
                                    Allow Public Student Self-Registration
                                    <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                                        When enabled, new students can register via the public signup portal.
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <Button variant="primary" size="sm" type="submit" loading={saving} icon={Save}>
                                Save Policies
                            </Button>
                        </div>
                    </Card>
                </form>
            )}

            {/* TAB 3: ADMIN ACCOUNT & SECURITY */}
            {activeTab === "security" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Admin Profile Overview */}
                    <Card className="p-6 bg-white shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">{user?.fullName || "Administrator"}</h3>
                                <Badge variant="primary" size="sm">SUPER ADMIN</Badge>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs">
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-medium">Administrator Email</span>
                                <span className="font-bold text-slate-900">{user?.email}</span>
                            </div>
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-medium">Assigned Role</span>
                                <span className="font-bold text-blue-600 uppercase tracking-wide">
                                    {user?.role || "admin"}
                                </span>
                            </div>
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-medium">Account Status</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Change Password Form */}
                    <Card className="p-6 bg-white shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                                Change Administrator Password
                            </h3>
                            <p className="text-xs text-slate-500">Update security key to protect access to the admin console</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Current Password *
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    New Password * (min 6 chars)
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Confirm New Password *
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                    loading={changingPassword}
                                    className="w-full"
                                    icon={Lock}
                                >
                                    Update Security Password
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* TAB 4: AUDIT LOGS */}
            {activeTab === "audit" && (
                <Card className="p-6 bg-white shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Administrative Action Audit Trail</h3>
                            <p className="text-xs text-slate-500">Immutable ledger tracking security events, payments, student updates, and credentials</p>
                        </div>
                        <Button variant="outline" size="xs" onClick={() => fetchAuditLogs(1)} icon={RotateCcw}>
                            Refresh Logs
                        </Button>
                    </div>

                    {loadingLogs ? (
                        <div className="py-16 text-center space-y-2">
                            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs text-slate-400">Loading audit records...</p>
                        </div>
                    ) : auditLogs.length === 0 ? (
                        <p className="py-12 text-center text-xs text-slate-400">No audit logs recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-3">Timestamp</th>
                                        <th className="py-2.5 px-3">Action</th>
                                        <th className="py-2.5 px-3">Performed By</th>
                                        <th className="py-2.5 px-3">Target</th>
                                        <th className="py-2.5 px-3">Details</th>
                                        <th className="py-2.5 px-3">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {auditLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Badge
                                                    variant={
                                                        log.action.includes("DELETE")
                                                            ? "danger"
                                                            : log.action.includes("PAYMENT") || log.action.includes("CREATE")
                                                            ? "success"
                                                            : "primary"
                                                    }
                                                    size="sm"
                                                >
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-slate-800">{log.performedBy}</td>
                                            <td className="py-2.5 px-3 text-slate-500 font-semibold">{log.targetType}</td>
                                            <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.ipAddress || "127.0.0.1"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default InstituteSettings;
