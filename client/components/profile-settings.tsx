"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, AlertCircle, Mail, CreditCard, Phone, CheckCircle2, Lock, Trash, Globe } from "lucide-react"; 
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

type TabKey = "profile" | "password" | "emergency";
const tabs: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "password", label: "Password" },
  { key: "emergency", label: "Emergency Contact"},
];

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col md:flex-row">        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 bg-orange-200 dark:bg-blue-800/30 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200 dark:bg-orange-800/20 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <aside className="md:w-60 border-b md:border-b-0 md:border-r border-slate-200 bg-gradient-to-b from-white to-amber-50/40 relative z-10">
            <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                Account Settings
            </h2>
            </div>
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
            {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                    "flex-1 md:flex-none px-5 py-3 md:px-6 md:py-4 text-sm font-medium flex items-center gap-2 transition",
                    isActive
                        ? "text-amber-700 bg-amber-50 border-l-4 border-amber-500 md:rounded-none"
                        : "text-slate-600 hover:bg-slate-50 md:border-l-4 md:border-transparent",
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                >
                    <span
                    className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-amber-500" : "bg-slate-300"
                    }`}
                    />
                    {tab.label}
                </button>
                );
            })}
            </nav>
        </aside>

        <main className="flex-1 px-6 py-6 bg-white relative z-10">
            {activeTab === "profile" && <AccountDetails />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "emergency" && <EmergencyTab />}
        </main>
        </div>
        <Footer />
    </div>
  );
}

function AccountDetails() {
  const [currentName, setCurrentName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Venmo" | "Zelle" | "PayPal" | "">("");
  const [paymentHandle, setPaymentHandle] = useState("");
  const [socialLink, setSocialLink] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/get-info`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();
        
        if (res.ok) {
          setCurrentName(data.user_info.name);
          setName(data.user_info.name);
          setEmail(data.user_info.email ?? "");
          setPhoneNumber(data.user_info.phone_number ?? "");
          setPaymentMethod(data.user_info.payment_method ?? "");
          setPaymentHandle(data.user_info.payment_handle ?? "");
          setSocialLink(data.user_info.prof_link ?? "");
        } else {
          setError("Error loading profile. You aren't signed in, perhaps?");
        }
      } catch (err) {
        console.error("Request failed, for some reason :/", err);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!name) {
      setError("Your name cannot be empty.");
      return;
    }

    if (!email) {
      setError("Your email cannot be empty.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (name.length > 255) {
      setError("Your name is too long.");
      return;
    }

    if (email.length > 255) {
      setError("Your email is too long.");
      return;
    }

    if (phoneNumber.length > 20) {
      setError("Your phone number is too long.");
      return;
    }

    if (paymentHandle.length > 100) {
      setError("Your payment handle is too long.");
      return;
    }

    if(socialLink.length > 255) {
        setError("Your social link is too long.");
        return;
    }

    // Validate payment info - both or neither must be filled
    if ((paymentMethod && !paymentHandle) || (!paymentMethod && paymentHandle)) {
      setError("Please provide both Payment Method and Payment Handle, or leave both empty.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/update-info`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber, paymentMethod, paymentHandle, socialLink }),
      });

      if (!res.ok) {
        setError("Something went wrong. Try again later.");
      } else {
        setCurrentName(name);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 10000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } 
    setIsLoading(false);
  };
  // god bless emily i'm stealing most of the existing styling from your part
  return (
    <div className="max-w-2xl">
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-orange-200 mb-2">
        Hello, {currentName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
        Manage your account information below.
        </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
        </div>
        )}
        
        {success && (
        <div className="p-3 border rounded text-green-700">
            <CheckCircle2 className="w-5 h-5 inline-block mr-2" />
            <span className="text-sm font-medium">Info successfully updated!</span>
        </div>
        )}

        <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Name
        </label>
        <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
            disabled={isLoading}
            maxLength={255}
            />
        </div>
        </div>

        <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Email Address
        </label>
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
            disabled={isLoading}
            maxLength={255}
            />
        </div>
        </div>

        <div className="space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Phone Number
        </label>
        <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
            disabled={isLoading}
            maxLength={20}
            />
        </div>
        </div>

        <div className="space-y-2">
        <label htmlFor="paymentMethod" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Payment Method
        </label>
        <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "Venmo" | "Zelle" | "PayPal" | "")}
                className="w-full h-10 px-3 pl-10 bg-orange-50 dark:bg-blue-900/30 border border-orange-200 dark:border-blue-800 rounded-md focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white appearance-none cursor-pointer"
                disabled={isLoading}
            >
                <option value="">Select payment method</option>
                <option value="Venmo">Venmo</option>
                <option value="Zelle">Zelle</option>
                <option value="PayPal">PayPal</option>
            </select>
        </div>
        </div>

        <div className="space-y-2">
        <label htmlFor="paymentHandle" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Payment Handle
        </label>
        <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            id="paymentHandle"
            type="text"
            placeholder="@username or email"
            value={paymentHandle}
            onChange={(e) => setPaymentHandle(e.target.value)}
            className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
            disabled={isLoading}
            maxLength={100}
            />
        </div>
        </div>

        <div className="space-y-2">
        <label htmlFor="socialLink" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Socials Link
        </label>
        <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            id="socialLink"
            type="text"
            placeholder="e.g. https://www.linkedin.com/in/you"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
            disabled={isLoading}
            maxLength={100}
            />
        </div>
        </div>

        <Button
        type="submit"
        className="w-full md:w-auto bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
        disabled={isLoading}
        >
        {isLoading ? "Updating..." : "Update Information"}
        </Button>
    </form>
    </div>
  );
}

function PasswordTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!newPassword) {
      setError("Your new password cannot be empty.");
      return;
    }

    if (!currentPassword) {
      setError("Fill out your current password.");
      return;
    }

    if (newPassword.length > 255) {
      setError("Your new password is too long.");
      return;
    }

    try {
      setError("");
      if (newPassword != confirmNewPassword) {
        setError("New passwords do not match.");
        return;
      }
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/update-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        setError("Invalid current password.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 10000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } 
    setIsLoading(false);
  };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 dark:text-orange-200 mb-2">
                    Change Password
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Update your password to keep your account secure.
                </p>
            </div>    
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
            </div>
            )}
            
            {success && (
            <div className="p-3 border rounded text-green-700">
                <CheckCircle2 className="w-5 h-5 inline-block mr-2" />
                <span className="text-sm font-medium">Info successfully updated!</span>
            </div>
            )}

            <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
                Current Password
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                id="curPassword"
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
                disabled={isLoading}
                maxLength={255}
                />
            </div>
            </div>

            <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
                New Password
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                id="newPassword"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
                disabled={isLoading}
                maxLength={255}
                />
            </div>
            </div>

            <div className="space-y-2">
            <label htmlFor="confirmNewPassword" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
                Confirm New Password
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
                disabled={isLoading}
                maxLength={255}
                />
            </div>
            </div>

            <Button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
            disabled={isLoading}
            >
            {isLoading ? "Updating..." : "Update Password"}
            </Button>
        </form>
        </div>
    );
}

function EmergencyTab() {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [emergencyContacts, setEmergencyContacts] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [relationship, setRelationship] = useState("");

    // god if i have to write another one of these i'm gonna lose it
    
    const loadEmergencyContacts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/get-emergency-contact`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();
        
        if (res.ok) {
          setEmergencyContacts(data.emergencyContacts)
        } else {
          setError("Error loading emergency contact. You aren't signed in, perhaps?");
        }
      } catch (err) {
        console.error("Request failed, for some reason :/", err);
      }
      setIsLoading(false);
    }

    useEffect(() => {
      loadEmergencyContacts();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!name) {
      setError("Contact's name cannot be empty.");
      return;
    }

    if (!phoneNumber) {
      setError("Contact's phone number cannot be empty.");
      return;
    }

    if (name.length > 255) {
      setError("Contact's name is too long.");
      return;
    }

    if (email.length > 255) {
      setError("Contact's email is too long.");
      return;
    }
    
    if (phoneNumber.length > 20) {
      setError("Contact's phone number is too long.");
      return;
    }

    if (relationship.length > 255) {
      setError("Contact's relationship is too long.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/add-emergency-contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber, relationship }),
      });

      if (!res.ok) {
        setError("Something went wrong adding the contact.");
      } else {
        await loadEmergencyContacts();
        setSuccess(true);
        setName("");
        setEmail("");
        setPhoneNumber("");
        setRelationship("");
        setIsModalOpen(false);
        setTimeout(() => setSuccess(false), 10000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } 
    setIsLoading(false);
    };

    const handleDelete = async (contact_id: number) => {
    setError("");
    setSuccess(false);
    // console.log(contact_id);
    try {
      setError("");
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/delete-emergency-contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id }),
      });

      if (!res.ok) {
        setError("Something went wrong delete the contact.");
      } else {
        await loadEmergencyContacts();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 10000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } 
    setIsLoading(false);
    };

    const openModal = () => {
        setIsModalOpen(true);
    }

    const closeModal = () => {
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setRelationship("");
      setError("");
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 dark:text-orange-200 mb-2">
                    Emergency Contacts
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Add important contacts in case of emergencies.
                </p>
                <Button
                  type="button"
                  onClick={openModal}
                  className="mt-4 w-full md:w-auto bg-blue-600 text-white rounded px-4 py-2"
                  disabled={isLoading}
                  >
                  {isLoading ? "Loading..." : "Add Contact"}
                </Button>
            </div>    
            
              {success && (
              <div className="p-3 border rounded text-green-700">
                <CheckCircle2 className="w-5 h-5 inline-block mr-2" />
                <span className="text-sm">Emergency contacts updated!</span>
              </div>
              )}
            {/* i KNOW this variant of checking looks scuffed but it's the only way I could thin kof :( */}
            {emergencyContacts.length > 0 && (
              <div className="mt-6 space-y-3">
                {emergencyContacts.map((c: any, idx: number) => (
                  <div
                    key={c.contact_id}
                    className="flex items-start justify-between gap-4 p-4 border rounded"
                  >
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate">{c.name}</h4>
                    <p className="text-xs mt-1">{c.relation_to_user || 'Unknown'}</p>
                    {c.phone_number && (
                        <p className="text-xs mt-1">{c.phone_number}</p>
                    )}
                    {c.email && (
                        <p className="text-xs mt-1">{c.email}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => handleDelete(c.contact_id)}
                    className="text-gray-600 hover:text-red-600 flex-shrink-0"
                    title="Delete contact"
                >
                    <Trash className="w-4 h-4" />
                </button>
              </div>
                ))}
              </div>
            )}

            {emergencyContacts.length === 0 && (
                <p className="text-sm text-blue-900 dark:text-orange-200 font-medium">You don't have any emergency contacts yet. Add one!</p>
            )}

            {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                
                <div className="mb-6 flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                    Add Emergency Contact
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                    Fill in the details for this contact.
                    </p>
                </div>
                </div>
                {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
                )}
                <form onSubmit={handleAdd} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="contactName" className="text-sm font-semibold text-blue-900">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="contactName"
                        type="text"
                        placeholder="Contact name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-orange-50 border-orange-200 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="text-sm font-semibold text-blue-900">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-orange-50 border-orange-200 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactPhone" className="text-sm font-semibold text-blue-900">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 bg-orange-50 border-orange-200 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="relationship" className="text-sm font-semibold text-blue-900">
                      Relationship
                    </label>
                    <Input
                      id="relationship"
                      type="text"
                      placeholder="Select or type a relationship"
                      list="relations"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="bg-orange-50 border-orange-200 focus:ring-orange-500"
                    />
                    {/* internet said use a datalist if you want suggestions and it looks p good to me */}
                    <datalist id="relations">
                      <option value="Mother" />
                      <option value="Father" />
                      <option value="Spouse" />
                      <option value="Sibling" />
                      <option value="Grandparent" />
                      <option value="Legal Guardian" />
                      <option value="Other" />
                    </datalist>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={closeModal}
                      className="border px-4 py-2 rounded"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Save Contact
                    </Button>
                  </div>
                </form>
            </div>
        </div>
      )}
    </div>
    );
}