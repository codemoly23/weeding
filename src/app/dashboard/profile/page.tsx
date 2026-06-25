"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Globe, Lock, Save, Loader2, AlertTriangle, Upload, Eye, EyeOff } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { sanitizePhone, sanitizeName, INPUT_LIMITS } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  image: string | null;
  twoFactorEnabled: boolean;
  notifOrderUpdates: boolean;
  notifDocumentReady: boolean;
  notifSupportReplies: boolean;
  notifComplianceReminders: boolean;
  notifMarketingEmails: boolean;
}

const countries = [
  { code: "SE", name: "Sweden" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "BD", name: "Bangladesh" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "OTHER", name: "Other" },
];

export default function ProfilePage() {
  const { update: updateSession } = useSession();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isTogglingTwoFactor, setIsTogglingTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState({
    notifOrderUpdates: true,
    notifDocumentReady: true,
    notifSupportReplies: true,
    notifComplianceReminders: true,
    notifMarketingEmails: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customer/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setUser(data.user);
      setTwoFactorEnabled(data.user.twoFactorEnabled ?? false);
      setNotifications({
        notifOrderUpdates: data.user.notifOrderUpdates ?? true,
        notifDocumentReady: data.user.notifDocumentReady ?? true,
        notifSupportReplies: data.user.notifSupportReplies ?? true,
        notifComplianceReminders: data.user.notifComplianceReminders ?? true,
        notifMarketingEmails: data.user.notifMarketingEmails ?? false,
      });
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        country: data.user.country || "",
      });
    } catch {
      toast.error(t("dashboard.profile.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    switch (name) {
      case "name":
        sanitizedValue = sanitizeName(value, INPUT_LIMITS.name.max);
        break;
      case "phone":
        sanitizedValue = sanitizePhone(value);
        break;
    }
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          country: formData.country || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      const data = await response.json();
      setUser(data.user);
      await updateSession({ name: data.user.name });
      toast.success(t("dashboard.profile.updateSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dashboard.profile.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("dashboard.profile.passwordMismatch"));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t("dashboard.profile.passwordTooShort"));
      return;
    }
    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/customer/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
      toast.success(t("dashboard.profile.passwordSuccess"));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dashboard.profile.passwordFailed"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(t("dashboard.profile.pleaseEnterPassword"));
      return;
    }
    try {
      setIsDeletingAccount(true);
      const res = await fetch("/api/customer/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }
      toast.success(t("dashboard.profile.accountDeleted"));
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dashboard.profile.accountDeleteFailed"));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleToggleTwoFactor = async (enabled: boolean) => {
    setIsTogglingTwoFactor(true);
    try {
      const res = await fetch("/api/customer/profile/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update 2FA");
      setTwoFactorEnabled(enabled);
      toast.success(enabled ? t("dashboard.profile.2faEnabled") : t("dashboard.profile.2faDisabled"));
    } catch {
      toast.error(t("dashboard.profile.2faFailed"));
    } finally {
      setIsTogglingTwoFactor(false);
    }
  };

  const handleToggleNotification = async (key: keyof typeof notifications, value: boolean) => {
    const prev = notifications[key];
    setNotifications((n) => ({ ...n, [key]: value }));
    try {
      const res = await fetch("/api/customer/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications((n) => ({ ...n, [key]: prev }));
      toast.error(t("dashboard.profile.notifFailed"));
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("dashboard.profile.imageTooLarge"));
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || t("dashboard.profile.uploadFailed"));
      }
      const { url } = await uploadRes.json();
      const profileRes = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}));
        throw new Error(err.error || t("dashboard.profile.photoSaveFailed"));
      }
      const data = await profileRes.json();
      setUser(data.user);
      await updateSession({ image: url });
      toast.success(t("dashboard.profile.photoUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("dashboard.profile.uploadFailed"));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.profile.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.profile.subtitle")}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.profile.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.profile.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t("dashboard.profile.tabProfile")}</TabsTrigger>
          <TabsTrigger value="security">{t("dashboard.profile.tabSecurity")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("dashboard.profile.tabNotifications")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.profile.profilePicture")}</CardTitle>
              <CardDescription>{t("dashboard.profile.profilePictureDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                {user?.image && <AvatarImage src={user.image} alt={user.name || "Profile"} />}
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(user?.name || null)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.profile.uploading")}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t("dashboard.profile.uploadPhoto")}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">{t("dashboard.profile.photoFormats")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.profile.personalInfo")}</CardTitle>
              <CardDescription>{t("dashboard.profile.personalInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("dashboard.profile.fullName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={INPUT_LIMITS.name.max}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("dashboard.profile.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-9 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.profile.emailCannotChange")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("dashboard.profile.phoneNumber")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={INPUT_LIMITS.phone.max}
                      placeholder="+1 234 567 8900"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t("dashboard.profile.country")}</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("dashboard.profile.selectCountry")} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.profile.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("common.saveChanges")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.profile.changePassword")}</CardTitle>
              <CardDescription>{t("dashboard.profile.changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("dashboard.profile.currentPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("dashboard.profile.newPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("dashboard.profile.confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.profile.updating")}
                    </>
                  ) : (
                    t("dashboard.profile.updatePassword")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.profile.twoFactor")}</CardTitle>
              <CardDescription>{t("dashboard.profile.twoFactorDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{t("dashboard.profile.enable2fa")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.profile.enable2faDesc")}</p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggleTwoFactor}
                  disabled={isTogglingTwoFactor}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t("dashboard.profile.dangerZone")}</CardTitle>
              <CardDescription>{t("dashboard.profile.dangerZoneDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{t("dashboard.profile.deleteAccount")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.profile.deleteAccountDesc")}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setDeletePassword(""); setDeleteDialogOpen(true); }}
                >
                  {t("dashboard.profile.deleteAccount")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {t("dashboard.profile.deleteAccount")}
                </DialogTitle>
                <DialogDescription className="pt-1">
                  {t("dashboard.profile.deleteAccountWarn")}{" "}
                  <strong>{t("dashboard.profile.cannotBeUndone")}</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="deletePassword">{t("dashboard.profile.confirmYourPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder={t("dashboard.profile.enterPassword")}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => { if (e.key === "Enter") handleDeleteAccount(); }}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeletingAccount}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || !deletePassword}
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.profile.deleting")}
                    </>
                  ) : (
                    t("dashboard.profile.confirmDeleteAccount")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.profile.emailNotifications")}</CardTitle>
              <CardDescription>{t("dashboard.profile.emailNotifDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                {
                  key: "notifOrderUpdates" as const,
                  titleKey: "dashboard.profile.notifOrderUpdates",
                  descKey: "dashboard.profile.notifOrderDesc",
                },
                {
                  key: "notifDocumentReady" as const,
                  titleKey: "dashboard.profile.notifDocReady",
                  descKey: "dashboard.profile.notifDocDesc",
                },
                {
                  key: "notifSupportReplies" as const,
                  titleKey: "dashboard.profile.notifSupport",
                  descKey: "dashboard.profile.notifSupportDesc",
                },
                {
                  key: "notifComplianceReminders" as const,
                  titleKey: "dashboard.profile.notifCompliance",
                  descKey: "dashboard.profile.notifComplianceDesc",
                },
                {
                  key: "notifMarketingEmails" as const,
                  titleKey: "dashboard.profile.notifMarketing",
                  descKey: "dashboard.profile.notifMarketingDesc",
                },
              ]).map((item, index, arr) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="font-medium">{t(item.titleKey)}</p>
                      <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(val) => handleToggleNotification(item.key, val)}
                    />
                  </div>
                  {index < arr.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
