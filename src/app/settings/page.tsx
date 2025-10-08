'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Protected from '@/components/auth/Protected';
import { User, Lock, Bell, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/context/authStore';
import { adminAPI } from '@/API/admin';
import { AdminProfileDto } from '@/types';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Profile settings
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<AdminProfileDto>({
    fullName: user?.name || '',
    email: user?.email || '',
    contactNumber: '',
    bio: '',
    imageUrl: undefined,
  });

  // Fetch existing profile from backend on mount
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingProfile(true);
        // First check existence quickly
        const exists = await adminAPI.checkProfileExists();
        setProfileExists(exists);
        if (!exists) {
          setEditMode(true); // directly allow creation
          return;
        }
        const profile = await adminAPI.getProfile();
        if (!ignore && profile) {
          setProfileData({
            fullName: profile.fullName || user?.name || '',
            email: profile.email || user?.email || '',
            contactNumber: profile.contactNumber,
            bio: profile.bio,
            imageUrl: profile.imageUrl,
            adminId: profile.adminId,
          });
          setProfileExists(true);
          // Keep auth store display updated (non-destructive)
          updateUser({ name: profile.fullName, email: profile.email, profilePicture: profile.imageUrl });
        }
      } catch (err: unknown) {
        interface AxiosLikeError { response?: { status?: number } }
        const status = (err as AxiosLikeError)?.response?.status;
        if (status === 404) {
          // Profile not created yet - silent
          setProfileExists(false);
          setEditMode(true);
        } else if (status === 401) {
          console.warn('Unauthorized fetching profile');
        } else {
          console.warn('Error fetching profile', err);
          toast.error('Could not load profile');
        }
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    })();
    return () => { ignore = true; };
    // We intentionally only react to user id changes; suppress exhaustive deps for name/email
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    paymentNotifications: true,
    tutorApprovals: true,
    studentActivity: false,
  });

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const saved = await adminAPI.saveProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        contactNumber: profileData.contactNumber,
        bio: profileData.bio,
        imageUrl: profileData.imageUrl,
      });
      // Update local auth store minimal fields
      updateUser({ name: saved.fullName, email: saved.email, profilePicture: saved.imageUrl });
      toast.success('Profile saved');
    } catch (err: unknown) {
      // Axios error shape
      interface AxiosLike { response?: { data?: unknown }; message?: string }
      const maybeAxios = err as AxiosLike;
      let msg: unknown = maybeAxios?.response?.data || maybeAxios?.message || 'Failed to save profile';
      if (msg && typeof msg === 'object') {
        const obj = msg as Record<string, unknown> & { message?: string; error?: string };
        msg = obj.message || obj.error || JSON.stringify(obj);
      }
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    try {
      setChangingPassword(true);
      await adminAPI.changePassword(securityData.newPassword);
      toast.success('Password changed successfully');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securityData.twoFactorEnabled,
      });
    } catch (err: unknown) {
  interface AxiosLikeError { response?: { data?: unknown } }
      const data = (err as AxiosLikeError)?.response?.data;
      let msg = 'Failed to change password';
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
        const maybe = (data as { message?: unknown }).message;
        if (typeof maybe === 'string') msg = maybe;
      }
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNotificationUpdate = () => {
    toast.success('Notification settings updated!');
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile Settings', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <Protected>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Settings</h1>
          <p className="text-text-light">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-light hover:text-text'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle>Profile Information</CardTitle>
                  {profileExists && (
                    <Button
                      variant={editMode ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => setEditMode(e => !e)}
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar src={profileData.imageUrl || user?.profilePicture} name={user?.name} size="xxl" />
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error('Image too large (max 2MB)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setProfileData((prev) => ({ ...prev, imageUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" leftIcon={<Upload size={18} />}>Change Photo</Button>
                    </label>
                    <p className="text-xs text-text-light">JPG/PNG/GIF up to 2MB. Preview updates immediately.</p>
                    {profileData.imageUrl && (
                      <button
                        onClick={() => setProfileData((p) => ({ ...p, imageUrl: undefined }))}
                        className="text-xs text-red-500 hover:underline"
                      >Remove</button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                  <Input
                    label="Contact Number"
                    value={profileData.contactNumber || ''}
                    onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Input
                    label="Brief Bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-text-light">Full Name</p>
                      <p className="font-medium text-text">{profileData.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-text-light">Email</p>
                      <p className="font-medium text-text break-all">{profileData.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-text-light">Contact Number</p>
                      <p className="font-medium text-text">{profileData.contactNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-text-light">Bio</p>
                      <p className="font-medium text-text max-w-prose whitespace-pre-line">{profileData.bio || '—'}</p>
                    </div>
                  </div>
                )}

                {editMode && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button
                      variant="primary"
                      leftIcon={<Save size={20} />}
                      disabled={saving}
                      onClick={async () => {
                        await handleProfileUpdate();
                        setEditMode(false);
                        setProfileExists(true);
                      }}
                    >
                      {saving ? 'Saving...' : (profileExists ? 'Save Changes' : 'Create Profile')}
                    </Button>
                    {loadingProfile && <p className="text-xs text-text-light animate-pulse">Loading profile...</p>}
                    {!loadingProfile && !profileExists && (
                      <p className="text-xs text-yellow-600">No profile yet – fill the form and save.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    setSecurityData({ ...securityData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    setSecurityData({ ...securityData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    setSecurityData({ ...securityData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                />
                <Button variant="primary" onClick={handlePasswordChange} disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div>
                    <p className="font-medium text-text">Enable 2FA</p>
                    <p className="text-sm text-text-light">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={(e) =>
                        setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive email notifications for important events' },
                  { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Get notified about payment requests and approvals' },
                  { key: 'tutorApprovals', label: 'Tutor Approvals', description: 'Notifications when tutors need approval' },
                  { key: 'studentActivity', label: 'Student Activity', description: 'Updates about student enrollments and activities' },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-background rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-text">{setting.label}</p>
                      <p className="text-sm text-text-light">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}

                <Button
                  variant="primary"
                  leftIcon={<Save size={20} />}
                  onClick={handleNotificationUpdate}
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
    </Protected>
  );
}
